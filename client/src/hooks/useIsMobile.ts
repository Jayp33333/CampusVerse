import { useEffect, useState } from "react";

const MOBILE_QUERY = "(hover: none) and (pointer: coarse)";

export function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}
