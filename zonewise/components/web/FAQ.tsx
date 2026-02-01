import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "What is ZoneWise.AI?",
    answer: "ZoneWise.AI is a verified zoning intelligence platform that provides instant access to Brevard County zoning regulations, 3D building envelope calculations, and sun/shadow analysis. We help property developers, real estate professionals, and homeowners make informed decisions about property development potential."
  },
  {
    question: "How accurate is your zoning data?",
    answer: "Our zoning data is sourced directly from official Brevard County municipal databases and verified regularly. We maintain partnerships with local jurisdictions including Melbourne, Palm Bay, Malabar, and other municipalities to ensure data accuracy and currency."
  },
  {
    question: "What's included in the Free plan?",
    answer: "The Free plan includes 3 property analyses per month, access to verified zoning data, basic 3D visualization, and 20 AI chat messages. It's perfect for occasional users or those wanting to try the platform before committing to a paid plan."
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes! You can upgrade or downgrade your plan at any time through your account dashboard. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle. No penalties or fees for changing plans."
  },
  {
    question: "What export formats do you support?",
    answer: "Pro and Team plans can export property analyses in multiple formats: PNG images for presentations, OBJ files for 3D modeling software, GeoJSON for GIS applications, and JSON for data integration. Free users have view-only access."
  },
  {
    question: "How does the AI chat work?",
    answer: "Our AI assistant uses advanced language models trained on zoning regulations and real estate terminology. It can answer questions about setbacks, height limits, permitted uses, and development potential. The AI has access to real-time zoning data and can perform calculations on your behalf."
  },
  {
    question: "What is the 3D building envelope?",
    answer: "The 3D building envelope is a visual representation of the maximum buildable volume on a property based on zoning regulations. It accounts for setbacks, height limits, and other restrictions to show you exactly what can be built on a given lot."
  },
  {
    question: "Do you support jurisdictions outside Brevard County?",
    answer: "Currently, ZoneWise.AI focuses exclusively on Brevard County, Florida to ensure the highest data quality and accuracy. We're planning to expand to additional Florida counties in 2026. Contact us if you'd like to be notified when your area is supported."
  },
  {
    question: "What is sun/shadow analysis?",
    answer: "Sun/shadow analysis shows how shadows from your proposed building will fall throughout the day and across seasons. This is crucial for understanding impacts on neighboring properties, optimizing solar panel placement, and planning outdoor spaces."
  },
  {
    question: "Can I share analyses with my team?",
    answer: "Team plan subscribers can share projects with team members, collaborate on analyses, and manage shared workspaces. Pro users can export and manually share files, but don't have built-in collaboration features."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. All transactions are encrypted and PCI-compliant."
  },
  {
    question: "Is there a refund policy?",
    answer: "We offer a 14-day money-back guarantee for first-time subscribers. If you're not satisfied with ZoneWise.AI within the first 14 days, contact support for a full refund. Refunds are not available after 14 days, but you can cancel anytime to avoid future charges."
  },
  {
    question: "How often is the data updated?",
    answer: "We update our zoning data monthly by syncing with official municipal databases. Major zoning code changes are typically reflected within 48 hours. You can always see the last update date in the property analysis interface."
  },
  {
    question: "Do you offer API access?",
    answer: "API access is available for Team plan subscribers and can be added to Pro plans for an additional fee. Our API provides programmatic access to zoning data, building envelope calculations, and export functionality. Contact sales for API documentation and pricing."
  },
  {
    question: "What if I exceed my monthly limits?",
    answer: "If you reach your monthly limit on the Free plan, you'll be prompted to upgrade to Pro for unlimited access. Pro and Team plans have no usage limits. Your usage resets on the 1st of each month."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time with no cancellation fees. You'll retain access until the end of your current billing period. Your data and saved analyses remain accessible even after cancellation."
  },
  {
    question: "Do you offer educational or non-profit discounts?",
    answer: "Yes! We offer 50% discounts for verified educational institutions, students, and registered non-profit organizations. Contact support with proof of status to request a discount code."
  },
  {
    question: "How do I get support?",
    answer: "All users have access to email support (support@zonewise.ai) with responses within 24 hours. Pro users get priority support with 4-hour response times. Team users get dedicated account management and phone support."
  }
];

export default function FAQ() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>
          Everything you need to know about ZoneWise.AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
