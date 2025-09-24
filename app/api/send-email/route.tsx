import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"

// Don't initialize at module level - this causes build errors
let resend: Resend | null = null

// Initialize Resend only when needed and API key is available
function getResendClient() {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder') {
    return null
  }
  
  if (!resend) {
    try {
      resend = new Resend(process.env.RESEND_API_KEY)
    } catch (error) {
      console.error("Failed to initialize Resend:", error)
      return null
    }
  }
  
  return resend
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    // Check if email service is available
    const resendClient = getResendClient()
    
    if (!resendClient) {
      console.warn("Email service not configured - RESEND_API_KEY missing or invalid")
      // Return success anyway to not break the application flow
      // In production, you might want to queue these for later sending
      return NextResponse.json({ 
        success: true, 
        message: "Email service not configured, but request processed",
        emailId: null 
      })
    }

    let emailContent = ""
    let subject = ""

    if (type === "suggestion") {
      subject = `New Suggestion: ${data.agenda_title || "Agenda Item"}`
      emailContent = `
        <h2>New Suggestion Submitted</h2>
        <p><strong>Author:</strong> ${data.author_name}</p>
        <p><strong>Agenda:</strong> ${data.agenda_title || "N/A"}</p>
        <p><strong>Suggestion:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${data.content.replace(/\n/g, "<br>")}
        </div>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p><em>This suggestion was submitted through the Nepal Reforms platform.</em></p>
      `
    } else if (type === "opinion") {
      subject = `New Opinion Submitted: ${data.title}`
      emailContent = `
        <h2>New Opinion/Agenda Submitted</h2>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Priority:</strong> ${data.priority_level}</p>
        
        <h3>Problem Statement:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${data.problem_statement.replace(/\n/g, "<br>")}
        </div>
        
        <h3>Description:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${data.description.replace(/\n/g, "<br>")}
        </div>
        
        ${
          data.key_points && data.key_points.length > 0
            ? `
          <h3>Key Points:</h3>
          <ul>
            ${data.key_points.map((point: string) => `<li>${point}</li>`).join("")}
          </ul>
        `
            : ""
        }
        
        ${
          data.proposed_solutions && data.proposed_solutions.length > 0
            ? `
          <h3>Proposed Solutions:</h3>
          <ul>
            ${data.proposed_solutions.map((solution: string) => `<li>${solution}</li>`).join("")}
          </ul>
        `
            : ""
        }
        
        ${
          data.implementation_timeline
            ? `
          <h3>Implementation Timeline:</h3>
          <p>${data.implementation_timeline.replace(/\n/g, "<br>")}</p>
        `
            : ""
        }
        
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p><em>This opinion was submitted through the Nepal Reforms platform.</em></p>
      `
    } else {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    try {
      const { data: emailData, error } = await resendClient.emails.send({
        from: "Nepal Reforms <noreply@nepalreforms.com>",
        to: ["suggestions@nepalreforms.com"],
        subject,
        html: emailContent,
      })

      if (error) {
        console.error("Resend error:", error)
        // Still return success to not break the flow
        return NextResponse.json({ 
          success: true, 
          message: "Email could not be sent, but request processed",
          emailId: null 
        })
      }

      return NextResponse.json({ success: true, emailId: emailData?.id })
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Still return success to not break the flow
      return NextResponse.json({ 
        success: true, 
        message: "Email could not be sent, but request processed",
        emailId: null 
      })
    }
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
