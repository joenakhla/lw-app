import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { slugify } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_name, contact_email, answers } = body;

    if (!business_name || !contact_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const slug = `${slugify(business_name)}-${Date.now().toString(36)}`;

    // (a) Save to Supabase
    const { data: client, error: dbError } = await supabase
      .from('clients')
      .insert({ slug, business_name, answers, status: 'onboarded' })
      .select()
      .single();

    if (dbError) throw new Error(`DB error: ${dbError.message}`);

    // (b) Webhook to OpenClaw Leo
    const webhookPayload = {
      event: 'new_client_onboarded',
      client_id: client.id,
      slug,
      business_name,
      contact_email,
      answers,
      portal_url: `${process.env.NEXT_PUBLIC_SITE_URL}/client/${slug}`,
      submitted_at: new Date().toISOString(),
    };

    const webhookRes = await fetch(
      'https://openclaw-q0m0.srv1857647.hstgr.cloud/webhook',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENCLAW_GATEWAY_TOKEN}`,
        },
        body: JSON.stringify(webhookPayload),
      }
    );

    if (!webhookRes.ok) {
      console.error('Webhook failed:', await webhookRes.text());
    }

    // (c) Confirmation email via Zoho SMTP
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.ZOHO_SMTP_USER,
          pass: process.env.ZOHO_SMTP_PASS,
        },
      });

      const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/client/${slug}`;

      await transporter.sendMail({
        from: `"Lead Waterfall" <${process.env.ZOHO_SMTP_USER}>`,
        to: contact_email,
        subject: `Welcome to Lead Waterfall — ${business_name}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#0A1628;color:#f8fafc;padding:40px;border-radius:12px;">
            <h1 style="color:#3B82F6;margin-bottom:8px;">You're onboarded 🎉</h1>
            <p style="color:#94a3b8;margin-bottom:24px;">
              Hi there — we've received your brief for <strong style="color:#fff">${business_name}</strong> and our AI agents are already getting to work.
            </p>
            <a href="${portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#3B82F6);color:#fff;padding:14px 28px;border-radius:8px;font-weight:600;text-decoration:none;margin-bottom:24px;">
              View Your Client Portal →
            </a>
            <p style="color:#64748b;font-size:14px;">
              You'll receive weekly reports, SEO rankings, and content updates directly in your portal.
              Reply to this email with any questions.
            </p>
            <hr style="border:none;border-top:1px solid #1e3a5f;margin:24px 0;"/>
            <p style="color:#334155;font-size:12px;">Lead Waterfall · leadwaterfall.com</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error('Email failed:', mailErr);
    }

    return NextResponse.json({ success: true, slug, client_id: client.id });
  } catch (err: unknown) {
    console.error('Onboard error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
