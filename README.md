# 🌱 Change Together

**Small actions, lasting change.**

Change Together is a community-service event platform that connects people with local volunteering opportunities and community initiatives. Users can discover upcoming events, participate in meaningful activities, and organize their own community drives, including clean-up campaigns, tree plantations, donation drives, food distribution, health camps, and educational sessions.

🔗 **Live Demo:** [Change Together](https://change-together.vercel.app/)

## ✨ Key Features

1. **🔐 Secure Authentication** — Sign up and sign in using email/password or GitHub authentication, powered by Better Auth and MongoDB. Includes password validation, live feedback, and toast notifications.

2. **🌍 Community Event Creation** — Organize community drives by providing event details such as title, description, category, thumbnail image, location, and event date.

3. **📅 Upcoming Event Discovery** — Browse all upcoming community events through a searchable and filterable grid. Past events are automatically excluded.

4. **🤝 Volunteer Participation** — Join or leave events with a single click. Participation records include snapshots of user and event information.

5. **🗂️ Event Management** — View, edit, and cancel events you have organized. Only the original organizer can modify or delete their events.

6. **📋 Joined Events Tracking** — Access a personal dashboard displaying all joined events, organized by event date.

7. **👤 Profile & Theme Customization** — Update your display name and profile picture, and switch between light and dark themes.

8. **🏡 Interactive Home Page** — Explore a community-focused hero section, feature highlights, six upcoming events fetched from MongoDB, a photo gallery, and a newsletter subscription section.

## 🧰 Technologies Used

| Category | Technologies |
|---|---|
| Framework | Next.js (App Router), React |
| Language | TypeScript |
| UI Components | shadcn/ui (Base UI) |
| Styling | Tailwind CSS v4 |
| Authentication | Better Auth, GitHub OAuth, JWT |
| Database | MongoDB (Native Driver) |
| Icons | lucide-react |

## 🚀 Getting Started

Follow these steps to run the project locally.

**1. Clone the repository**

```bash
git clone https://github.com/TaheraScript/Change-Together.git
```

**2. Navigate to the project directory**

```bash
cd Change-Together
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env.local` file in the root directory and add the following variables:

```env
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB_NAME=change-together

BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Optional: External events REST API
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional: GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**5. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Application Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page with hero, features, upcoming events, gallery, and newsletter |
| `/upcoming-events` | Public | Browse and filter upcoming events |
| `/events/[id]` | Public | View event details and join events |
| `/login` | Public | Sign in using email/password or GitHub |
| `/register` | Public | Create a new account |
| `/create-event` | Private | Create a community event |
| `/manage-events` | Private | Manage, edit, and cancel organized events |
| `/joined-events` | Private | View joined events |
| `/profile` | Private | View and update profile information |

**Route Protection:** Private routes are protected through the authentication middleware in `src/proxy.ts`.

## 📁 Project Structure

```text
src/
├── app/           # App Router pages, layouts and API routes
├── components/    # Reusable UI and feature components
│   ├── auth/
│   ├── event/
│   ├── home/
│   ├── profile/
│   ├── shared/
│   └── ui/
├── lib/           # Authentication, MongoDB and event data helpers
└── proxy.ts       # Authentication-based route protection
```

## 🔐 Additional Notes

- **Data Fallback:** Events are fetched from MongoDB first, with the external events REST API used as a fallback to maintain event availability when the primary backend is unavailable.
- **Authentication:** Email verification and password reset functionality are not currently implemented.
- **GitHub OAuth:** GitHub authentication requires valid OAuth client credentials in the environment variables.

## 🔗 Relevant Links

- 🌐 **Live Demo:** [Change Together](https://change-together.vercel.app/)
- 💻 **GitHub Repository:** [Change Together](https://github.com/TaheraScript/Change-Together)
- ▲ **Next.js:** [nextjs.org](https://nextjs.org/)
- ⚛️ **React:** [react.dev](https://react.dev/)
- 📘 **TypeScript:** [typescriptlang.org](https://www.typescriptlang.org/)
- 🎨 **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com/)
- 🍃 **MongoDB:** [mongodb.com](https://www.mongodb.com/)
- 🔐 **Better Auth:** [better-auth.com](https://www.better-auth.com/)