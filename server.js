const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const services = [
  {
    slug: "career-consultation",
    title: "Quick Career Consultation",
    duration: 30,
    price: "€75",
    summary: "A focused consultation for career clarity, CV direction, and next steps."
  },
  {
    slug: "interview-prep",
    title: "Interview Preparation",
    duration: 45,
    price: "€110",
    summary: "Structured mock interview and feedback tailored to your target role."
  },
  {
    slug: "job-search-package",
    title: "Complete Job Search Coaching Package",
    duration: 60,
    price: "€299",
    summary: "Three coaching sessions with practical support for your search strategy."
  },
  {
    slug: "executive-package",
    title: "Executive Premium Package",
    duration: 60,
    price: "€450",
    summary: "A premium coaching package for leadership positioning and executive growth."
  }
];

const testimonials = [
  {
    name: "A. L.",
    role: "Director, Switzerland",
    text: "The coaching gave me more than a polished CV — it sharpened my professional positioning."
  },
  {
    name: "O. R.",
    role: "Regional Executive, USA",
    text: "Insightful, responsive, and highly professional throughout the process."
  },
  {
    name: "M. F.",
    role: "Director Aerospace, Mexico",
    text: "A remarkable coach with genuine passion for leadership development."
  }
];

const articles = [
  {
    title: "How to Improve Your CV for Senior Roles",
    category: "Career Tips",
    excerpt: "A practical guide to presenting leadership, outcomes, and commercial impact."
  },
  {
    title: "What Recruiters Notice First on LinkedIn",
    category: "LinkedIn",
    excerpt: "The profile elements that shape first impressions and interview chances."
  },
  {
    title: "Preparing for a Leadership Interview",
    category: "Executive Coaching",
    excerpt: "How to answer strategic, behavioural, and stakeholder-management questions."
  }
];

function getGoogleCalendarClient() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/calendar"]
  );

  return google.calendar({ version: "v3", auth });
}

async function createCalendarEvent({ name, email, serviceTitle, date, time, duration, notes }) {
  const calendar = getGoogleCalendarClient();

  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

  const event = {
    summary: `${serviceTitle} — ${name}`,
    description: `Booking request from coaching website\n\nClient: ${name}\nEmail: ${email}\nService: ${serviceTitle}\nNotes: ${notes || "None"}`,
    start: { dateTime: startDateTime.toISOString() },
    end: { dateTime: endDateTime.toISOString() },
    attendees: [{ email }],
    conferenceData: {
      createRequest: {
        requestId: uuidv4(),
        conferenceSolutionKey: { type: "hangoutsMeet" }
      }
    }
  };

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    resource: event,
    conferenceDataVersion: 1,
    sendUpdates: "all"
  });

  return response.data;
}

app.get("/", (req, res) => {
  res.render("home", { services, testimonials, articles });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/services", (req, res) => {
  res.render("services", {
    services,
    success: req.query.success,
    selectedService: req.query.selected || ""
  });
});

app.get("/corporate", (req, res) => {
  res.render("corporate");
});

app.get("/articles", (req, res) => {
  res.render("articles", { articles });
});

app.get("/contact", (req, res) => {
  res.render("contact", { success: req.query.success });
});

app.post("/book", async (req, res) => {
  try {
    const { name, email, serviceSlug, date, time, notes } = req.body;
    const selectedService = services.find((s) => s.slug === serviceSlug);

    if (!selectedService) {
      return res.status(400).send("Invalid service selected.");
    }

    await createCalendarEvent({
      name,
      email,
      serviceTitle: selectedService.title,
      date,
      time,
      duration: selectedService.duration,
      notes
    });

    res.redirect("/services?success=1");
  } catch (error) {
    console.error("Booking error:", error.message);
    res.status(500).send("Something went wrong while creating the booking.");
  }
});

app.post("/contact", (req, res) => {
  console.log("Contact form:", req.body);
  res.redirect("/contact?success=1");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
