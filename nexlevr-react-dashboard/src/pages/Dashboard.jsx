import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import ChallengeList from "../components/ChallengeList";
import useLocalStorage from "../hooks/useLocalStorage";
import { useTheme } from "../context/ThemeContext";

function Dashboard() {
  //   const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useLocalStorage("search", "");
  const { theme } = useTheme();
  const [stats, setStats] = useState([
    {
      id: 1,
      title: "Learning Paths",
      value: 12,
    },
    {
      id: 2,
      title: "Challenges",
      value: 28,
    },
    {
      id: 3,
      title: "Achievements",
      value: 5,
    },
    {
      id: 4,
      title: "Skill Score",
      value: 1240,
    },
  ]);

  const [challenges] = useState([
    {
      id: 1,
      title: "Responsive Landing Page",
      status: "Completed",
    },
    {
      id: 2,
      title: "Accessible Component Library",
      status: "Completed",
    },
    {
      id: 3,
      title: "React Dashboard",
      status: "In Progress",
    },
    {
      id: 4,
      title: "Lighthouse Optimization",
      status: "Completed",
    },
    {
      id: 5,
      title: "React Hooks",
      status: "In Progress",
    },
  ]);
  const filteredChallenges = challenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const completeChallenge = () => {
    setStats((previousStats) =>
      previousStats.map((item) => {
        if (item.title === "Achievements") {
          return {
            ...item,
            value: item.value + 1,
          };
        }

        if (item.title === "Skill Score") {
          return {
            ...item,
            value: item.value + 50,
          };
        }

        return item;
      }),
    );
  };
  return (
    <div className={`dashboard-layout ${theme}`}>
      <Sidebar />

      <div className="main-content">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <main>
          <h1>Welcome back, Tejas 👋</h1>
          <p>Let's continue your learning journey.</p>

          <div className="cards">
            {stats.map((item) => (
              <DashboardCard
                key={item.id}
                title={item.title}
                value={item.value}
              />
            ))}
          </div>
          <button className="complete-btn" onClick={completeChallenge}>
            Complete Challenge
          </button>

          <ChallengeList challenges={filteredChallenges} />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
