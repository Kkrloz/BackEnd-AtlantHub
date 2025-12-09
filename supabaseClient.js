// Usar versão ESM do Supabase via CDN para rodar direto no navegador
// (necessário quando o site é servido sem bundler, ex: GitHub Pages)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Pegue essas informações no painel do Supabase: Settings > API
const supabaseUrl = "https://qatfptamutggnytlhlij.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdGZwdGFtdXRnZ255dGxobGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODY5NzUsImV4cCI6MjA4MDM2Mjk3NX0.1y9c6j1S2QfYfp79_hmZVsyA8b1gl645uc-7mIuAcNM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
