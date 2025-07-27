/// <reference types="vite/client" />
/// <reference path="./types/globals.d.ts" />

declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

declare module 'jspdf' {
  const jsPDF: any;
  export default jsPDF;
}

declare module 'html2canvas' {
  const html2canvas: any;
  export default html2canvas;
}