import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const PauseInProgress = ({ pausas }) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const activePause = pausas?.find((p) => !p.fim);
    if (!activePause) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startTime = new Date(activePause.inicio);
      const elapsed = Math.floor((now - startTime) / 1000);

      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;

      const formatted = [
        hours > 0 ? `${hours}h` : null,
        `${minutes}m`,
        `${seconds}s`
      ].filter(Boolean).join(" ");

      setTime(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [pausas]);

  return time ? `⏳ ${time}` : null;
};

PauseInProgress.propTypes = {
  pausas: PropTypes.arrayOf(
    PropTypes.shape({
      inicio: PropTypes.string.isRequired,
      fim: PropTypes.string,
    })
  ).isRequired,
};

export default PauseInProgress;
