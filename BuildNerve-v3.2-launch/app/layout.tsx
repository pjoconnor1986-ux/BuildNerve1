import "./globals.css";
export const metadata = {
  title: "BuildNerve v3.1",
  description: "AI construction operating system for UK contractors"
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
