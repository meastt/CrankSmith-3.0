// app/layout.tsx
import './globals.css'

export const metadata = {
  title: 'CrankSmith 3.0 - Professional Drivetrain Analysis',
  description: 'The most accurate gear ratio calculator with real compatibility checking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}