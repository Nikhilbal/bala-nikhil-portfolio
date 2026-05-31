import React, { useMemo } from "react";
import { motion } from "framer-motion";
import "./App.css";

const profile = {
  name: "Bala Nikhil",
  role: "Full Stack Developer | React Native Developer | Node.js Developer | AI-Powered Applications Developer",
  location: "Hyderabad, India",
  relocation: "Open to Relocate: Dubai, UAE",
  email: "balanikhilnikhil@gmail.com",
  phone: "+91 9110753008",
  github: "https://github.com/nikhilbal",
  linkedin: "https://www.linkedin.com/in/bala-nikhil-91225b287/",
};

const skills = [
  "JavaScript", "TypeScript", "Python", "C", "React.js", "React Native", "Expo", "HTML5", "CSS3", "Tailwind CSS", "Redux", "Node.js", "Express.js", "REST APIs", "JWT", "RBAC", "PostgreSQL", "MongoDB", "MySQL", "AWS EC2", "S3", "Lambda", "Git", "GitHub", "Postman", "Figma", "Pandas", "NumPy", "Machine Learning", "K-Means", "Streamlit", "Google Maps API", "Socket.io", "Payments", "IoT", "Raspberry Pi"
];

const projects = [
  {
    title: "PoolGo",
    tag: "AI Ride Sharing Mobile App",
    imageType: "mobile",
    stack: ["React Native", "Expo", "Redux", "Node.js", "PostgreSQL", "Google Maps"],
    description: "Full-stack AI-powered ride sharing app with ride creation, booking, real-time search, intelligent ride matching, OTP authentication, driver KYC, backend APIs, and modern mobile UI.",
    link: "https://github.com/nikhilbal",
  },
  {
    title: "Auto Smart Cart Billing System",
    tag: "IoT + Full Stack Platform",
    imageType: "cart",
    stack: ["React.js", "Node.js", "Express", "Raspberry Pi", "REST APIs", "Payments"],
    description: "Real-time IoT-enabled smart billing platform integrating Raspberry Pi hardware with dynamic cart billing, live sync, UPI/card payments, and automated checkout logic.",
    link: "https://github.com/nikhilbal",
  },
  {
    title: "Customer 360 Analytics Platform",
    tag: "ML Analytics Dashboard",
    imageType: "analytics",
    stack: ["Python", "Pandas", "NumPy", "K-Means", "Streamlit", "ML"],
    description: "End-to-end analytics dashboard for customer behavior analysis, segmentation, churn insights, and interactive business intelligence using machine learning.",
    link: "https://github.com/nikhilbal",
  },
];

const education = [
  {
    school: "Guru Nanak Institute of Technology, Hyderabad",
    degree: "Bachelor of Engineering in Electronics & Communication Engineering",
    score: "CGPA: 8.1",
    duration: "2022 – 2026",
  },
  {
    school: "NANO Junior College, Hyderabad",
    degree: "Intermediate – MPC",
    score: "Score: 87%",
    duration: "2020 – 2022",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0 },
};

function Particles() {
  const particles = useMemo(() => Array.from({ length: 38 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 4,
    duration: 5 + Math.random() * 8,
  })), []);

  return (
    <div className="particles" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="particle"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [-18, 24, -18], opacity: [0.15, 0.9, 0.15], scale: [1, 1.8, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ProjectVisual({ type }) {
  if (type === "mobile") {
    return (
      <div className="mockup mobile-mockup">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="map-grid" />
          <div className="route-line" />
          <div className="pin pin-a" />
          <div className="pin pin-b" />
          <div className="ride-card-mini">
            <b>PoolGo Match</b>
            <span>AI confidence 94%</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "cart") {
    return (
      <div className="mockup cart-mockup">
        <div className="cart-screen">
          <div className="scan-ring" />
          <div className="cart-body">🛒</div>
          <div className="bill-panel">
            <span>Milk ₹60</span>
            <span>Bread ₹45</span>
            <b>Total ₹105</b>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mockup analytics-mockup">
      <div className="dashboard-card">
        <div className="chart-bars">
          <span style={{ height: "42%" }} />
          <span style={{ height: "78%" }} />
          <span style={{ height: "55%" }} />
          <span style={{ height: "88%" }} />
          <span style={{ height: "62%" }} />
        </div>
        <div className="donut" />
        <div className="metric-row"><b>Customer Segments</b><em>4 Active</em></div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ duration: 0.65 }}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </motion.div>
  );
}

function App() {
  return (
    <div className="portfolio-app">
      <div className="background-glow" />
      <Particles />

      <header className="navbar">
        <a href="#home" className="brand">BN<span>.</span></a>
        <nav>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="nav-cta" href={`mailto:${profile.email}`}>Hire Me</a>
      </header>

      <main>
        <section id="home" className="hero section-container">
          <motion.div className="hero-content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="hero-pill">🚀 {profile.relocation}</div>
            <h1>Building AI-Powered Products That Solve Real Problems.</h1>
            <p className="hero-subtitle">I build full-stack, mobile, AI, and IoT applications that turn ideas into real-world products.</p>
            <p className="hero-role">{profile.role}</p>

            <div className="hero-actions">
              <a href="#projects" className="primary-btn">View Projects <span>→</span></a>
              <a href="/Bala_Nikhil_Resume.pdf" download className="secondary-btn">⬇ Download Resume</a>
              <a href={`mailto:${profile.email}`} className="ghost-btn">Contact Me</a>
            </div>

            <div className="hero-meta">
              <span>📍 {profile.location}</span>
              <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </motion.div>

          <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.86, rotateX: 20 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ duration: 1 }}>
            <div className="orb-3d">
              <div className="orb-ring ring-one" />
              <div className="orb-ring ring-two" />
              <div className="orb-core">
                <span>AI</span>
                <small>Full Stack</small>
              </div>
              <div className="floating-chip chip-1">React</div>
              <div className="floating-chip chip-2">Node</div>
              <div className="floating-chip chip-3">IoT</div>
              <div className="floating-chip chip-4">ML</div>
            </div>
          </motion.div>
        </section>

        <section id="about" className="section-container section-block">
          <SectionHeader eyebrow="About" title="Product-minded developer for modern teams" text="I design and develop scalable apps that combine clean UI, backend logic, data, AI, and real-world product thinking." />
          <div className="about-grid">
            {[
              ["⚡", "Full Stack", "React, Node.js, Express, APIs, databases, authentication, and scalable web apps."],
              ["📱", "Mobile Apps", "React Native and Expo apps with smooth mobile-first user experiences."],
              ["🤖", "AI Applications", "ML dashboards, recommendation systems, AI workflows, and data-driven features."],
              ["🧠", "IoT Systems", "Raspberry Pi integrations, real-time sync, smart billing, and sensor-based products."],
            ].map(([icon, title, text]) => (
              <motion.article key={title} className="glass-card about-card" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ duration: 0.55 }}>
                <div className="card-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="skills" className="section-container section-block">
          <SectionHeader eyebrow="Skills" title="Engineering toolkit" text="A practical stack for frontend, backend, mobile, cloud, payments, maps, analytics, AI, and IoT product development." />
          <motion.div className="skills-cloud" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ duration: 0.6 }}>
            {skills.map((skill, index) => (
              <motion.span key={skill} className="skill-badge" whileHover={{ y: -6, scale: 1.04 }} transition={{ type: "spring", stiffness: 300 }} style={{ animationDelay: `${index * 0.03}s` }}>
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </section>

        <section id="experience" className="section-container section-block">
          <SectionHeader eyebrow="Experience" title="Professional experience" />
          <motion.div className="timeline-card" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="timeline-dot" />
            <div className="experience-top">
              <div>
                <h3>Software Development Engineer Intern</h3>
                <p>Bluestock.in — Fintech IPO Platform</p>
              </div>
              <span>May 2025 – July 2025</span>
            </div>
            <ul>
              <li>Built secure admin dashboard features for IPO listing and internal workflows.</li>
              <li>Implemented RBAC and permission-based access control.</li>
              <li>Integrated REST APIs for IPO data, analytics, and workflow automation.</li>
              <li>Improved admin efficiency by 30%.</li>
              <li>Reduced dashboard load time by 25%.</li>
            </ul>
          </motion.div>
        </section>

        <section id="projects" className="section-container section-block">
          <SectionHeader eyebrow="Featured Projects" title="Startup-ready product builds" text="Projects presented like real products with strong engineering, AI thinking, clean UI, and recruiter-friendly positioning." />
          <div className="projects-grid">
            {projects.map((project, index) => (
              <motion.article key={project.title} className="project-card" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ duration: 0.65, delay: index * 0.12 }} whileHover={{ y: -14, rotateX: 4, rotateY: -4 }}>
                <ProjectVisual type={project.imageType} />
                <div className="project-content">
                  <span className="project-tag">{project.tag}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-stack">
                    {project.stack.map((item) => <span key={item}>{item}</span>)}
                  </div>
                  <a href={project.link} target="_blank" rel="noreferrer">View Project →</a>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="education" className="section-container section-block">
          <SectionHeader eyebrow="Education" title="Academic background" />
          <div className="education-grid">
            {education.map((item) => (
              <motion.div key={item.school} className="glass-card education-card" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <span className="edu-icon">🎓</span>
                <h3>{item.school}</h3>
                <p>{item.degree}</p>
                <b>{item.score}</b>
                <small>{item.duration}</small>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="contact" className="section-container section-block">
          <SectionHeader eyebrow="Contact" title="Let’s build something useful" text="Available for full-stack, React Native, Node.js, and AI-powered application roles." />
          <motion.div className="contact-card" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <a href={`mailto:${profile.email}`}>✉ {profile.email}</a>
            <a href={`tel:${profile.phone}`}>📞 {profile.phone}</a>
            <a href={profile.github} target="_blank" rel="noreferrer">🔗 GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">💼 LinkedIn</a>
          </motion.div>
        </section>
      </main>

      <footer>
        <p>© 2026 Bala Nikhil. Designed for recruiters, founders, and engineering managers.</p>
      </footer>
    </div>
  );
}

export default App;