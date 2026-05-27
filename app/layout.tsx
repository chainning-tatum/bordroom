import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BORDROOM — was this meeting necessary?',
  description: 'Paste your meeting notes. Get an honest verdict.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { font-size: 16px; }
          body {
            font-family: 'DM Sans', sans-serif;
            background: #f7f4ef;
            color: #0a0a0a;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
          }
          a { color: inherit; }
          button { font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; background: none; }
          textarea {
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            color: #0a0a0a;
            background: white;
            border: 1px solid rgba(10,10,10,0.25);
            border-radius: 4px;
            padding: 12px 14px;
            width: 100%;
            resize: vertical;
            outline: none;
            line-height: 1.65;
          }
          textarea:focus { border-color: #0a0a0a; }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes stampIn {
            0% { opacity: 0; transform: scale(1.3); }
            70% { opacity: 1; transform: scale(0.97); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
