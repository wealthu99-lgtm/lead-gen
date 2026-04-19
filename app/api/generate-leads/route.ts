import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const niche = formData.get('niche') as string;
    const roles = formData.get('roles') as string;
    const goal = formData.get('goal') as string;
    const numLeads = parseInt(formData.get('numLeads') as string) || 100;

    if (!niche) {
      return NextResponse.json({ success: false, error: 'Niche is required' });
    }

    // TODO: Add your API keys here later
    const mapsKey = process.env.MAPS_API_KEY || '';
    const geminiKey = process.env.GEMINI_API_KEY || '';
    const csKey = process.env.CUSTOM_SEARCH_KEY || '';
    const cx = process.env.SEARCH_ENGINE_ID || '';

    // 1. Scrape from Google Maps
    const mapsUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=\( {encodeURIComponent(niche)}&key= \){mapsKey}`;
    const mapsRes = await fetch(mapsUrl);
    const mapsData = await mapsRes.json();

    const leads: any[] = [];
    let count = 0;

    for (const place of mapsData.results || []) {
      if (count >= numLeads) break;

      const company = place.name;
      const address = place.formatted_address || 'N/A';
      const phone = place.formatted_phone_number || 'N/A';
      const website = place.website || 'N/A';
      const email = website !== 'N/A' 
        ? `info@${website.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '')}` 
        : 'N/A';

      // 2. LinkedIn search
      const liUrl = `https://customsearch.googleapis.com/customsearch/v1?key=\( {csKey}&cx= \){cx}&q=${encodeURIComponent(company + ' owner OR CEO linkedin')}`;
      let linkedin = 'N/A';
      try {
        const liRes = await fetch(liUrl);
        const liData = await liRes.json();
        if (liData.items && liData.items[0]) linkedin = liData.items[0].link;
      } catch (e) {}

      // 3. Gemini verification
      const prompt = `Verify this lead for ${goal}. Company: ${company} Email: ${email} LinkedIn: ${linkedin}. Output exactly:\nContact Name: ...\nJob Title: ...\nMatch Confidence: XX%\nNotes: ...`;
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const geminiData = await geminiRes.json();
      const vText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const conf = parseInt((vText.match(/Match Confidence: (\d+)/i) || [0, 70])[1]);

      if (conf >= 85) {
        count++;
        leads.push({
          sn: count,
          company,
          contactName: vText.match(/Contact Name: (.*)/i)?.[1]?.trim() || 'N/A',
          jobTitle: vText.match(/Job Title: (.*)/i)?.[1]?.trim() || 'N/A',
          email,
          phone,
          linkedin,
          website,
          address,
          instagram: 'N/A',
          facebook: 'N/A',
          twitter: 'N/A',
          youtube: 'N/A',
          notes: vText.match(/Notes: ([\s\S]*)/i)?.[1]?.trim() || 'Verified Active'
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal server error' });
  }
        }
