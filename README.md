# 📚 NoteShelf - Collaborative Book Highlights

Every book. Every insight. One place. **NoteShelf** is a modern platform designed for readers to capture, share, and collaborate on book highlights, insights, and takeaways.


## 🌟 Project Overview

NoteShelf is a collaborative library system that allows users to organize their reading insights by chapters and categories. Whether it's a profound quote, a personal note, or a key takeaway, NoteShelf provides a structured and beautiful interface to store and discover wisdom from literature.

## 🚀 Features

- **📖 Book Library**: Browse and manage a collection of books with high-quality cover art.
- **📑 Chapter Organization**: Insights are neatly organized by chapters for easy reference.
- **💡 Categorized Highlights**:
  - **Quotes**: Direct lines from the book.
  - **Notes**: Personal thoughts and reflections.
  - **Takeaways**: Actionable lessons learned.
- **👤 User Profiles**: Show off your reading progress and contributed highlights.
- **🔒 Secure Authentication**: Login via Google, Microsoft Entra ID, or traditional email/password.
- **👍 Upvoting System**: Interact with the community by upvoting the most insightful highlights.
- **🌓 Dark Mode**: A premium, theme-aware UI designed for comfortable reading day or night.

## 💻 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router & Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📸 Screenshots


## 📂 Folder Structure

```text
Noteshelf/
├── app/                # Next.js App Router (Pages & API Routes)
│   ├── api/            # Backend API endpoints
│   ├── auth/           # Authentication pages
│   ├── books/          # Book-specific pages
│   └── profile/        # User profile pages
├── components/         # Reusable UI components
├── lib/                # Library utilities (Prisma client, etc.)
├── prisma/             # Database schema and migrations
├── public/             # Static assets (images, icons)
├── auth.ts             # NextAuth configuration
├── next.config.ts      # Next.js configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 🛠️ Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/justShounak-07/Noteshelf.git
   cd Noteshelf
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file and add the following:
   ```env
   DATABASE_URL="your_postgresql_url"
   AUTH_SECRET="your_secret"
   GOOGLE_CLIENT_ID="your_id"
   GOOGLE_CLIENT_SECRET="your_secret"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Visit [http://localhost:3000](http://localhost:3000).

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
