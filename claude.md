This file contains branding guidelines, voice standards, and workflow instructions for building and maintaining the Find Your Ink website using Claude Code.
Website: Find Your Ink (findyourinkinchrist.com)
Mission: Discover healing and emotional transformation through Christ-centered insights, personal stories, and resources for faith and identity.
Tagline: "Some broke and bled. I broke and wrote. Now Christ holds the pen."

⚡ CRITICAL: Skill-Based Routing Protocol
BEFORE executing ANY task, Claude MUST:

Analyze the request to determine what type of work is needed
Check for relevant skills in the /mnt/skills/ directory
Load and follow the appropriate skill before proceeding
Use multiple skills when needed (e.g., frontend-design + SEO for landing pages)

Before starting ANY task, execute:
 Check what skills are available


🎨 Brand Identity
Visual Identity

Primary Logo: [Upload location to be specified]
Color Palette:

Primary: Deep Black (#1a1a1a) - Represents depth, truth, gravitas
Secondary: Warm Gold (#C9A961) - Represents redemption, value, divine light
Accent: Soft Cream (#F5F5F0) - Represents healing, peace, new beginnings
Text Dark: Charcoal (#333333)
Text Light: Medium Gray (#666666)
Background: Pure White (#FFFFFF) with subtle textures



Typography

Headers: Playfair Display, Georgia, or Libre Baskerville (serif, elegant, literary)
Body: Inter, Source Sans Pro, or system font stack (sans-serif, clean, readable)
Accent/Quotes: Crimson Text or PT Serif (for pull quotes and emphasis)
Code/Technical: JetBrains Mono or Fira Code (if needed)

Design Principles

White space as sacred space - Generous margins, breathing room, intentional emptiness
Typography as voice - Line breaks matter, rhythm matters, visual poetry
Minimalist with warmth - Clean but never cold, simple but never sterile
Mobile-first reverence - Most readers will encounter this on phones in quiet moments
Accessibility as compassion - Everyone deserves access to healing words


✍️ Voice & Tone (Critical for All Content)
Core Voice Characteristics
This is NOT generic Christian content. This is prophetic precision meets pastoral tenderness.
Voice DNA:

Poetic but not flowery - Line breaks create rhythm, not decoration
Confessional but not self-indulgent - Vulnerability serves the reader
Theological but not academic - Deep truth in accessible language
Challenging but not condemning - Confrontation with compassion
African-rooted but universally human - Cultural specificity illuminates shared experience

The Line Break as Breath
Text must be formatted with intentional white space:
Wrong:
"I used to think the world was smarter than me. More capable. More certain."

Right:
I used to think the world was smarter than me.
More capable. More certain. More complete.
Structural Patterns to Maintain
Opening Hook Pattern:
*[Italicized subtitle that disrupts or disarms]*

[Short, confessional statement]
[Amplification]
[Amplification]

[Pivot to universal truth]
The Triple Negation:
It's not [common assumption].
It's not [another assumption].
It's [the real truth].
Block Quote Axioms:
> "[Quotable, paradoxical truth that sticks]"
Final Words Pattern:
You are not [lie].
You are not [lie].
You are [truth].

[Single powerful closing line.]
Content Standards

No Christian clichés unless interrogating them
No shallow positivity - Hope is earned through honesty
No culture war rhetoric - Truth over tribes
Scripture as lived experience, not proof-texting
Psychology and theology integrated, never separated
Personal cost visible in every piece


📐 Website Architecture
Core Pages

Home - Hero statement, latest posts, mission statement
About - David's story, mission, "Some broke and bled" narrative
Blog - Main content hub, filterable by topic
Resources - Book recommendations, tools, external links
Contact - Email signup, social links, collaboration inquiries

Blog Categories/Tags

Faith & Doubt
Trauma & Healing
Emotional Intelligence
Cultural Commentary (African context)
Spiritual Formation
Identity in Christ
Generational Patterns
Mind & Neuroscience

Technical Requirements

Performance: Sub-3s page load, optimized images
SEO: Meta descriptions using voice patterns, schema markup for articles
Analytics: Track engagement, time on page, scroll depth
Newsletter: Email capture with double opt-in
Social sharing: Custom OG images for each post
RSS Feed: For blog subscribers
Accessibility: WCAG 2.1 AA minimum


🔧 Development Workflow
Before Writing Any Code

Identify the task type (page, component, content, document)
Check and load relevant skills:


Read the skill files completely before proceeding
Follow skill guidelines for that specific task type

Web Development Standards

Framework: Use modern, semantic HTML5
CSS: Mobile-first, use CSS custom properties for theming
JavaScript: Vanilla JS preferred, progressive enhancement
Images: WebP with fallbacks, lazy loading, responsive srcsets
Forms: Proper validation, accessibility labels, error states

SEO Workflow (If SEO Skill Available)

Load SEO skill from /mnt/skills/user/
Follow its meta description formula
Integrate voice patterns into meta content
Generate schema.org Article markup for blog posts
Create custom OG images using brand colors and typography

Content Creation Workflow

Always load: fyi-writing-style-SKILL.md first
Check implementation checklist in the skill file
Structure: Italicized subtitle → Opening confession → Sections with poetic headers → Final Words
Format: Line breaks for rhythm, block quotes for axioms
Close: Declaration, not summary


📊 Quality Checklist
For Every Web Page

 Skill files checked and loaded
 Mobile responsive (tested 320px - 1920px)
 Semantic HTML throughout
 Proper heading hierarchy (h1 → h2 → h3)
 Alt text on all images (descriptive, not decorative)
 Color contrast meets WCAG AA
 Meta description written in brand voice (50-160 chars)
 OG tags for social sharing
 Performance: Lighthouse score 90+
 White space used generously
 Typography matches brand guidelines
 CTA is clear and compassionate

For Every Blog Post

 Writing style skill loaded and followed
 Italicized subtitle present
 Opens with confession or disruption
 Line breaks used for rhythm
 At least 2-3 block-quoted axioms
 Section headers are evocative, not functional
 Closes with "Final Words" or equivalent
 Final sentence is a mic-drop
 No Christian clichés (unless interrogated)
 Personal vulnerability visible
 Theology integrated, not plastered on
 Meta description captures the hook
 Image selected (contemplative, not stock-photo-y)
 Categories/tags assigned
 Related posts suggested

For Every Document

 Appropriate skill loaded (docx/pdf/pptx/xlsx)
 Brand colors applied where possible
 Typography matches guidelines
 Professional but warm aesthetic
 Accessible formatting
 Final output reviewed for quality


🚀 Launch Checklist
Pre-Launch

 All pages built and tested
 Blog functionality working
 Email signup integrated
 Analytics installed and tested
 SEO meta tags on all pages
 Social sharing tested
 Mobile performance optimized
 Cross-browser testing complete
 404 page created (on-brand)
 Privacy policy and terms (if collecting emails)

Content Ready

 About page tells the "broke and wrote" story
 At least 5-7 blog posts published
 Resources page curated
 Contact information clear
 Bio and headshot professional
 Email welcome sequence drafted

Marketing

 OG images for all pages
 Social media accounts linked
 Launch announcement drafted
 Email to existing list (if applicable)
 RSS feed configured


💡 Content Ideas Bank
Evergreen Topics (Voice-Aligned)

"The Sabbath Your Ancestors Never Took: Generational Rest Debt"
"When Prayer Feels Like Performance: The Exhaustion of Spiritual Theater"
"Decolonizing Your Faith: What African Christians Inherited That Isn't Biblical"
"The Difference Between Being Anointed and Being Whole"
"Why Smart Christians Struggle to Feel Their Feelings"
"The Violence of Unforgiveness (and Why Forgiveness Isn't Forgetting)"
"Prophets Without Platforms: When God Gives You Truth But Not Reach"
"The Myth of the Strong Black Woman (and the God Who Calls Her Human)"

Series Ideas

Rewiring Series: Neuroplasticity + Scripture (expand on existing post)
Inheritance Series: What we got from our parents (trauma, faith, patterns)
Prophetic vs. Pastoral Series: When to flip tables, when to hold hands
African Church Series: Honest critique with deep love


📞 Brand Voice Examples (Quick Reference)
Wrong (Generic Christian):
"God has amazing plans for your life! Trust in Him and you'll see miracles!"
Right (FYI Voice):
"The plans God has for you might not look amazing.
They might look like rebuilding.
Like rewiring.
Like learning to breathe without apologizing for taking up space.
That's not less than a miracle.
That's the kind that lasts."

Wrong (Preachy):
"You need to forgive because the Bible says so. Unforgiveness is sin."
Right (FYI Voice):
"Unforgiveness isn't just spiritual rebellion.
It's a neural prison.
Every time you rehearse the wound, you deepen the groove.
Forgiveness doesn't let them off the hook.
It releases you from the hook you've been hung on."

Wrong (Academic Theology):
"The concept of neuroplasticity aligns with the biblical doctrine of sanctification as outlined in Romans 12:2, wherein believers are exhorted to experience cognitive transformation."
Right (FYI Voice):
"Long before scientists tracked synaptic changes,
Scripture declared:
'Be transformed by the renewing of your mind.'
Renewing.
Not repaired once, then left to rust—
but a continual rewiring."

🎯 Success Metrics
Engagement

Average time on page: 3+ minutes
Scroll depth: 75%+ complete reads
Bounce rate: <40%
Return visitor rate: Growing month over month

Growth

Email list growing organically
Social shares increasing
Comments engaging (quality over quantity)
External links/citations growing

Impact (Qualitative)

Testimonials about transformation
Messages from readers finding healing
Pastors/leaders sharing content
Translation requests (impact beyond English)


🔐 Final Reminders

Always load skills before working - This prevents generic output
Voice is non-negotiable - If it doesn't sound like David, rewrite it
White space is sacred - Never compromise on formatting for "fitting more in"
Mobile experience is primary - Most healing happens on phones at 2am
Accessibility is pastoral care - Everyone deserves access to these words
SEO serves the message - Optimize to reach people, not to rank
Every word costs something - David writes from scars; honor that in every piece