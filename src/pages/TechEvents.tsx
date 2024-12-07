import React, { useState, useEffect } from "react";

const TechEvents: React.FC = () => {
  const [hackathonIndex, setHackathonIndex] = useState(0);
  const [workshopIndex, setWorkshopIndex] = useState(0);

  const hackathons = Array.from({ length: 22 }, (_, index) => ({
    title: `Hackathon ${index + 1}`,
    domain: [
      "AI",
      "Blockchain",
      "Cybersecurity",
      "Cloud Computing",
      "Data Science",
      "Web Development",
      "IoT",
    ][index % 7],
    date: `2024-0${(index % 12) + 1}-15`,
    location: "Hyderabad",
    featured: index % 5 === 0,
  }));

  const workshops = [
    {
      title: "Web Development Bootcamp",
      domain: "Web Development",
      date: "2023-11-15",
      location: "Hyderabad",
    },
    {
      title: "Data Science with Python",
      domain: "Data Science",
      date: "2023-12-10",
      location: "Hyderabad",
    },
    {
      title: "Blockchain Essentials",
      domain: "Blockchain",
      date: "2024-01-20",
      location: "Hyderabad",
    },
    {
      title: "Machine Learning for Beginners",
      domain: "AI",
      date: "2024-02-05",
      location: "Hyderabad",
    },
    {
      title: "Cybersecurity Fundamentals",
      domain: "Cybersecurity",
      date: "2024-03-10",
      location: "Hyderabad",
    },
  ];

  const handleSlide = (
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    length: number,
    direction: number
  ) => {
    setIndex((prevIndex) => (prevIndex + direction + length) % length);
  };

  const renderEventCard = (event: any, isFeatured: boolean = false) => (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        position: "relative",
        width: "100%",
        maxWidth: "450px",
        transition: "transform 0.3s ease-in-out",
        marginBottom: "2rem",
      }}
    >
      {isFeatured && (
        <span
          style={{
            position: "absolute",
            top: "-10px",
            left: "10px",
            backgroundColor: "#f39c12",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          FEATURED
        </span>
      )}
      <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{event.title}</h3>
      <p style={{ fontSize: "1rem", color: "#555" }}>📅 {event.date}</p>
      <p style={{ fontSize: "1rem", color: "#555" }}>📍 {event.location}</p>
      <p style={{ fontSize: "1rem", color: "#555", fontStyle: "italic" }}>
        🌐 Domain: {event.domain}
      </p>
      <button
        style={{
          backgroundColor: "#3498db",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          padding: "0.5rem 1rem",
          marginTop: "1rem",
          cursor: "pointer",
          fontSize: "1rem",
        }}
        onClick={() => alert(`Registered for ${event.title}`)}
      >
        Register Now
      </button>
    </div>
  );

  useEffect(() => {
    const hackathonInterval = setInterval(() => {
      setHackathonIndex((prevIndex) => (prevIndex + 1) % hackathons.length);
    }, 5000);

    const workshopInterval = setInterval(() => {
      setWorkshopIndex((prevIndex) => (prevIndex + 1) % workshops.length);
    }, 5000);

    return () => {
      clearInterval(hackathonInterval);
      clearInterval(workshopInterval);
    };
  }, [hackathons.length, workshops.length]);

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        backgroundColor: "#f8f9fa", // Update this to match the home page's background
        color: "#000",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "black",
          }}
        >
          Tech Events
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            maxWidth: "800px",
            margin: "0 auto",
            color: "black",
          }}
        >
          Stay updated with the latest in tech! From hackathons to technical
          workshops, join us to explore, learn, and innovate!
        </p>
      </header>

      <main>
        <section id="hackathons" style={{ marginBottom: "3rem" }}>
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "1rem",
              color: "#34495e",
              textAlign: "center",
            }}
          >
            Hackathons in Hyderabad
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: "2rem",
                cursor: "pointer",
                color: "#3498db",
              }}
              onClick={() => handleSlide(setHackathonIndex, hackathons.length, -1)}
            >
              ❮
            </button>
            {renderEventCard(
              hackathons[hackathonIndex],
              hackathons[hackathonIndex].featured
            )}
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: "2rem",
                cursor: "pointer",
                color: "#3498db",
              }}
              onClick={() => handleSlide(setHackathonIndex, hackathons.length, 1)}
            >
              ❯
            </button>
          </div>
        </section>

        <section id="workshops" style={{ marginBottom: "3rem" }}>
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "1rem",
              color: "#34495e",
              textAlign: "center",
            }}
          >
            Technical Workshops in Hyderabad
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: "2rem",
                cursor: "pointer",
                color: "#3498db",
              }}
              onClick={() => handleSlide(setWorkshopIndex, workshops.length, -1)}
            >
              ❮
            </button>
            {renderEventCard(workshops[workshopIndex])}
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: "2rem",
                cursor: "pointer",
                color: "#3498db",
              }}
              onClick={() => handleSlide(setWorkshopIndex, workshops.length, 1)}
            >
              ❯
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TechEvents;