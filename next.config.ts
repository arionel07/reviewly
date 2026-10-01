import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev`/`next build` otherwise generate and append AI-agent
  // instructions into AGENTS.md on every run, which this project already
  // maintains by hand.
  agentRules: false,
};

export default nextConfig;
