import { useState, useEffect } from "react";

const VotingCountdown = ({ election }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState(""); // "before", "active", "ended"

  useEffect(() => {
    if (!election.votingStartTime || !election.votingEndTime) {
      setStatus("no-time");
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const [startHour, startMin] = election.votingStartTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = election.votingEndTime.split(":").map(Number);
      const [currentHour, currentMin] = currentTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const currentMinutes = currentHour * 60 + currentMin;

      if (currentMinutes < startMinutes) {
        // Before voting starts
        const diff = startMinutes - currentMinutes;
        setStatus("before");
        setTimeLeft({
          hours: Math.floor(diff / 60),
          minutes: diff % 60,
        });
      } else if (
        currentMinutes >= startMinutes &&
        currentMinutes <= endMinutes
      ) {
        // Voting is active
        const diff = endMinutes - currentMinutes;
        setStatus("active");
        setTimeLeft({
          hours: Math.floor(diff / 60),
          minutes: diff % 60,
        });
      } else {
        // Voting has ended
        setStatus("ended");
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [election]);

  if (status === "no-time") {
    return null;
  }

  if (status === "ended") {
    return (
      <div className="flex items-center gap-2 text-rose-600 text-sm font-bold">
        <span>⏰</span>
        <span>ভোটিং সময় শেষ</span>
      </div>
    );
  }

  if (status === "before") {
    return (
      <div className="flex items-center gap-2 text-amber-600 text-sm font-bold">
        <span>⏰</span>
        <span>
          শুরু হবে {timeLeft.hours > 0 && `${timeLeft.hours} ঘন্টা `}
          {timeLeft.minutes} মিনিটে
        </span>
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-pulse">
        <span>🔴</span>
        <span>
          বাকি {timeLeft.hours > 0 && `${timeLeft.hours} ঘন্টা `}
          {timeLeft.minutes} মিনিট
        </span>
      </div>
    );
  }

  return null;
};

export default VotingCountdown;
