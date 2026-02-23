import { useEffect } from "react";

function useMobileDetection() {
  useEffect(() => {
    const isMobile =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;

    if (isMobile) {
      document.body.classList.add("mobile-mode");
    } else {
      document.body.classList.remove("mobile-mode");
    }
  }, []);
}

export default useMobileDetection;
