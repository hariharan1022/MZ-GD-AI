@echo off
echo Installing frontend packages...
call npm install axios react-router-dom @tanstack/react-query react-hook-form zod @hookform/resolvers socket.io-client framer-motion recharts lucide-react sonner clsx tailwind-merge class-variance-authority date-fns xlsx jspdf html2canvas simple-peer webrtc-adapter

echo Initializing shadcn UI...
call npx -y shadcn@latest init -d

echo Adding shadcn components...
call npx -y shadcn@latest add button card input form table dialog dropdown-menu badge avatar progress tabs toast chart -y

echo Frontend setup complete!
