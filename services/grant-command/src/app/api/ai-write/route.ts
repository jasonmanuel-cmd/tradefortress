import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabase } from '@/lib/supabase-server'
import { COAI_PROFILE } from '@/lib/coai-profile'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const DOC_PROMPTS: Record<string, string> = {
  executive_summary: `Write a compelling Executive Summary (300-400 words) for this grant application. Lead with COAI's unique value proposition in the Central Valley tech space. Be specific, data-driven where possible, and tie directly to the funder's stated priorities.`,
  
  need_statement: `Write a Need Statement / Problem Statement (400-500 words) that clearly articulates the technology gap and digital divide facing small businesses in Bakersfield's 661 market. Reference Central Valley economic data where appropriate. Connect the problem directly to what COAI solves.`,
  
  project_description: `Write a detailed Project Description (600-800 words) describing exactly what COAI will do with this grant funding. Include: specific deliverables, timeline, methodology, how COAI's AI/automation services will be deployed, and measurable outcomes for the community served.`,
  
  budget_narrative: `Write a Budget Narrative that justifies the grant request. Break down how funds will be allocated across: personnel/consultant time, technology infrastructure, software development, outreach/marketing, and operational costs. Be specific and justify each line item.`,
  
  loi: `Write a Letter of Intent (LOI) (1-2 pages) introducing COAI and expressing intent to apply for this grant. Include: who we are, our mission alignment with this funder, the core project concept, requested amount range, and why COAI is uniquely positioned to deliver results.`,
  
  full_proposal: `Write a complete Grant Proposal including: Executive Summary, Organization Background, Need Statement, Project Description, Evaluation Plan, Budget Overview, and Conclusion. This should be a polished, professional, submission-ready document.`,
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase()

    // Auth check — only logged-in users can generate documents
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { grantId, docType, customInstructions } = await req.json()

    if (!grantId || !docType) {
      return NextResponse.json({ error: 'grantId and docType required' }, { status: 400 })
    }

    // Fetch grant details
    const { data: grant, error } = await supabase
      .from('grants')
      .select('*')
      .eq('id', grantId)
      .single()

    if (error || !grant) {
      return NextResponse.json({ error: 'Grant not found' }, { status: 404 })
    }

    const docPrompt = DOC_PROMPTS[docType] || DOC_PROMPTS.full_proposal

    const systemPrompt = `You are a professional grant writer specializing in technology sector grants for small businesses. You are writing on behalf of the following organization:

${COAI_PROFILE}

Your writing style is:
- Professional, clear, and compelling
- Specific with measurable outcomes wherever possible
- Aligned with the funder's stated priorities
- Free of jargon while maintaining credibility
- Action-oriented — funders should feel confident in COAI's ability to execute

Always write in first person as the organization ("COAI will..." / "Our team...").
Do not include placeholder text in brackets — if you don't have specific data, make a reasonable professional assumption and note it can be updated.`

    const userMessage = `
## GRANT OPPORTUNITY DETAILS:
**Title:** ${grant.title}
**Funder:** ${grant.funder}
**Grant Type:** ${grant.grant_type}
**Category:** ${grant.category}
**Award Amount:** ${grant.amount_min ? `$${grant.amount_min.toLocaleString()}` : 'Unspecified'} – ${grant.amount_max ? `$${grant.amount_max.toLocaleString()}` : 'Unspecified'}
**Deadline:** ${grant.deadline || 'Rolling'}
**Location:** ${grant.location}
**Description:** ${grant.description || 'Not provided'}
**Requirements:** ${grant.requirements || 'Standard grant requirements'}
**Eligibility:** ${grant.eligibility || 'Small business / technology organization'}
**Source:** ${grant.source_url || 'N/A'}

## DOCUMENT TO GENERATE:
${docPrompt}

${customInstructions ? `## ADDITIONAL INSTRUCTIONS FROM JASON:\n${customInstructions}` : ''}

Write the document now. Format with clear headers and professional structure.`

    // Doc-type-specific token budgets — full proposals need room to breathe
    const TOKEN_LIMITS: Record<string, number> = {
      executive_summary: 1500,
      need_statement: 2000,
      project_description: 3000,
      budget_narrative: 2500,
      loi: 2500,
      full_proposal: 8000,
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: TOKEN_LIMITS[docType] || 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to DB
    const { data: savedDoc, error: saveError } = await supabase
      .from('documents')
      .insert({
        grant_id: grantId,
        doc_type: docType,
        title: `${docType.replace('_', ' ').toUpperCase()} — ${grant.title}`,
        content,
        ai_generated: true,
        version: 1,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save error:', saveError)
      // Still return content even if save fails
      return NextResponse.json({ content, saved: false })
    }

    return NextResponse.json({ content, document: savedDoc, saved: true })

  } catch (err: any) {
    console.error('AI Writer error:', err)
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}
