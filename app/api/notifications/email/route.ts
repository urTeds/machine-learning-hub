import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

type EmailEventType = "new_article" | "like" | "comment";

interface EmailRequestBody {
  eventType: EmailEventType;
  articleId: string;
  actorId: string;
}

interface ArticleRow {
  id: string;
  title: string;
  author_id: string | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role?: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getActorName(profile: ProfileRow | null | undefined): string {
  const fullName = profile?.full_name?.trim();
  if (fullName) return fullName;
  const email = profile?.email?.trim();
  if (email) return email;
  return "A user";
}

function buildEmailTemplate(subject: string, message: string): string {
  return `
    <div style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 12px; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; color: #ffffff; font-size: 20px;">${escapeHtml(subject)}</h2>
      <p style="margin: 0; line-height: 1.6; font-size: 14px; color: #cbd5e1;">${escapeHtml(message)}</p>
      <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8;">Machine Learning Hub</p>
    </div>
  `;
}

async function sendEmail(params: {
  resendClient: Resend;
  fromAddress: string;
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const response = await params.resendClient.emails.send({
      from: params.fromAddress,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    return !response.error;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: "Supabase environment is missing" },
        { status: 500 }
      );
    }

    // Do not block core app actions when email is not configured.
    if (!resendApiKey || !fromAddress) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Email provider not configured",
      });
    }

    const resendClient = new Resend(resendApiKey);

    const body = (await request.json()) as Partial<EmailRequestBody>;
    const { eventType, articleId, actorId } = body;

    if (!eventType || !articleId || !actorId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["new_article", "like", "comment"].includes(eventType)) {
      return NextResponse.json(
        { success: false, error: "Invalid event type" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: articleData, error: articleError } = await supabase
      .from("articles")
      .select("id, title, author_id")
      .eq("id", articleId)
      .maybeSingle();

    if (articleError || !articleData) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    const article = articleData as ArticleRow;

    const { data: actorProfileData } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", actorId)
      .maybeSingle();

    const actorProfile = (actorProfileData as ProfileRow | null) ?? null;
    const actorName = getActorName(actorProfile);

    if (eventType === "new_article") {
      const { data: recipientsData, error: recipientsError } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("role", "user")
        .neq("id", actorId);

      if (recipientsError) {
        return NextResponse.json(
          { success: false, error: recipientsError.message },
          { status: 500 }
        );
      }

      const recipients = (recipientsData as ProfileRow[])
        .map((p) => p.email?.trim())
        .filter((email): email is string => Boolean(email));

      if (recipients.length === 0) {
        return NextResponse.json({ success: true, sentCount: 0, skipped: true });
      }

      const subject = `New article published: ${article.title}`;
      const message = `${actorName} published a new article: ${article.title}`;
      const html = buildEmailTemplate(subject, message);

      const results = await Promise.allSettled(
        recipients.map((to) =>
          sendEmail({
            resendClient,
            fromAddress,
            to,
            subject,
            html,
          })
        )
      );

      const sentCount = results.filter(
        (result) => result.status === "fulfilled" && result.value
      ).length;

      return NextResponse.json({
        success: true,
        sentCount,
        recipientCount: recipients.length,
      });
    }

    if (!article.author_id || article.author_id === actorId) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "No admin recipient for this event",
      });
    }

    const { data: adminProfileData, error: adminProfileError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", article.author_id)
      .maybeSingle();

    if (adminProfileError || !adminProfileData) {
      return NextResponse.json(
        { success: false, error: "Admin profile not found" },
        { status: 404 }
      );
    }

    const adminProfile = adminProfileData as ProfileRow;
    const adminEmail = adminProfile.email?.trim();

    if (!adminEmail) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Admin email is missing",
      });
    }

    const subject =
      eventType === "like"
        ? `${actorName} liked your article`
        : `${actorName} commented on your article`;

    const message =
      eventType === "like"
        ? `${actorName} liked your article: ${article.title}`
        : `${actorName} commented on your article: ${article.title}`;

    const html = buildEmailTemplate(subject, message);

    const sent = await sendEmail({
      resendClient,
      fromAddress,
      to: adminEmail,
      subject,
      html,
    });

    return NextResponse.json({ success: true, sentCount: sent ? 1 : 0 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to send email notifications" },
      { status: 500 }
    );
  }
}
