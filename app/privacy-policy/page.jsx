"use client"

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Vabgo.com Privacy Policy</h1>
          <p className="text-muted-foreground">Effective Date: October 30, 2024</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-lg">
            Vabgo ("we," "us," or "our") respects the privacy of our users ("you" or "your"). 
            This Privacy Policy describes the types of information we collect and how we use it 
            when you visit or use our website, Vabgo.com (the "Website").
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p>We collect information from you in several ways when you use the Website:</p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>Information You Provide Directly:</strong> This may include your name, 
                email address, phone number, company affiliation, property details, and any other 
                information you choose to provide in your profile or communications with us.
              </li>
              <li>
                <strong>Information We Collect Automatically:</strong> When you visit the Website, 
                we may automatically collect certain information about your device and browsing activity, 
                such as your IP address, browser type, operating system, referring URL, and pages visited 
                on the Website.
              </li>
              <li>
                <strong>Information from Cookies and Similar Technologies:</strong> We may use cookies 
                and similar technologies to collect information about your activity on the Website.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To operate and maintain the Website</li>
              <li>To provide you with the services offered on the Website</li>
              <li>To communicate with you about your use of the Website</li>
              <li>To respond to your inquiries and requests</li>
              <li>To personalize your experience on the Website</li>
              <li>To improve the Website and our services</li>
              <li>To send you marketing and promotional materials (with your consent)</li>
              <li>To analyze user behavior on the Website</li>
              <li>To comply with the law</li>
            </ul>
          </section>

          {/* Add remaining sections following the same pattern */}

          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <p>
              By email:{' '}
              <a 
                href="mailto:contact@vabgo.com" 
                className="text-primary hover:underline"
              >
                contact@vabgo.com
              </a>
            </p>
          </section>

          <p className="text-sm text-muted-foreground border-t pt-8">
            This Privacy Policy is incorporated into and subject to the Terms of Use of Vabgo.com.
          </p>
        </div>
      </div>
    </div>
  )
} 