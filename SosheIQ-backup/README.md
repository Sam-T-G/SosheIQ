# SosheIQ

## Inspiration

Coming out of the COVID-19 pandemic, I noticed something unsettling: people had forgotten how to talk to each other. The isolation, combined with our already screen-saturated lives, had created a perfect storm. Eye contact became rare, group interactions turned tense, and many individuals — especially young adults — felt disconnected, not just from others, but from themselves. 

This wasn’t just anecdotal. Social anxiety rates spiked. Relationship formation slowed. Even birthrates fell in parallel with a global decline in interpersonal connection. I created **SosheIQ** to address that — to reawaken the lost art of conversation and human connection in a post-pandemic world.

## What it does

SosheIQ is an AI-powered social skills trainer designed to help users improve real-world interpersonal communication. It simulates lifelike conversations — complete with social cues, nonverbal hints, and subtle emotional signals — and evaluates how users respond. 

Key features:
- Simulated AI conversations with context-based feedback  
- Nonverbal cue recognition (e.g., facial expressions, posture hints)  
- Visual prompts and avatars generated using Imagen  
- Social cue analysis for empathy, timing, and appropriateness  
- Progress tracking over time  

Think of it as a personal trainer for your social intelligence.

## How we built it

We built SosheIQ using:
- **Next.js** for a fast, interactive front-end  
- **Gemini API** to generate dynamic, scenario-based dialogues and evaluate responses  
- **Imagen API** to create expressive avatars and nonverbal visual cues  
- **Node.js backend** for session tracking and scoring logic  
- **Google Cloud Run** to host and scale our app effortlessly  
- **Tailwind CSS** for a clean and accessible UI  

The architecture is modular to support future expansion into voice/video simulation.

## Challenges we ran into

- **Nuancing human behavior:** Teaching AI to recognize or simulate tone, intent, and nonverbal cues required thoughtful prompting and iterative fine-tuning.  
- **Realistic visuals:** Integrating Imagen in a way that enhanced the experience without uncanny valley effects took UI/UX iteration.  
- **Feedback tone:** Designing feedback that was honest but encouraging — like a real social coach — was harder than expected.  
- **Post-pandemic realism:** Balancing realistic social scenarios with optimism (without making them too clinical or awkward) was a creative challenge.

## Accomplishments that we're proud of

- Created a working AI model that gives **real-time conversational feedback**
- Integrated **dynamic visuals** that reflect tone and social context using Imagen  
- Developed a design system that feels **approachable and non-judgmental**
- Built a scalable backend for **tracking emotional/social growth**
- Got validation from early testers who said it “felt like therapy but more fun”

## What we learned

- Social intelligence is just as **trainable as technical skill**
- Visuals can **amplify empathy** when used with intention
- People are eager for **judgment-free spaces** to practice being human again
- Crafting emotional intelligence into an AI product is not only possible — it’s essential
- Conversation is a **two-way rhythm**, not just scripted input/output

## What's next for SosheIQ

- Integrate **voice analysis** and **facial emotion detection** for richer simulations  
- Introduce **customizable personas** (e.g., date night, job interview, family dinner)  
- Partner with therapists and educators to fine-tune simulation content  
- Expand into HR and soft-skills training environments  
- Build out a **mobile version** for on-the-go practice  

Our ultimate goal is to make SosheIQ a core part of how people build confidence in the one skill we all need — human connection.
