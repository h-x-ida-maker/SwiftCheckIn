# **App Name**: SwiftCheck

## Core Features:

- Event Import: Import event details (number, details, date, seats) by providing a JSON link. Reads and processes the event details from the link to populate the application.
- QR Code API: Provide an API endpoint to generate QR codes using event number, ticket number, timestamp, and an HMAC signature for secure ticket validation. Return link and button on screen.
- Event Dashboard: Display a dashboard summarizing key event metrics such as event name, total seats, and the current check-in count for real-time monitoring.
- Detailed Check-in Log: Maintain a detailed log of check-in activities, including event name, user number/name, and the precise check-in time. Present on its own dashboard page.
- Seat Availability Tool: Employ a tool that uses an LLM to decide when a seat may have become available even if not released; if open seats are identified, automatically flag certain records for review and potential action.

## Style Guidelines:

- Primary color: Strong Blue (#29ABE2) to evoke a sense of reliability and efficiency.
- Background color: Light blue (#E5F6FD), subtly tinted with the hue of the primary color, for a clean, unobtrusive backdrop.
- Accent color: A vibrant Lime Green (#A7D129) for buttons/links, contrasting effectively for easy interaction.
- Font: 'Inter', a grotesque-style sans-serif for its modern and neutral appearance; suitable for both headlines and body text.
- Use a grid-based layout for both dashboards to ensure content is well-organized and easy to navigate, improving the user experience.
- Employ a set of consistent and simple icons to visually represent event details, check-in status, and other relevant information.