# ByeFrust-AI 🤖🛒
**An unbiased, adaptive AI that interviews users to deliver confident, personalized product recommendations.**

ByeFrust-AI is designed to eliminate "choice paralysis." By utilizing a conversational interface, the system acts as a digital shopping assistant that understands user intent, context, and specific needs to find the perfect product match without the noise of sponsored results.

---

## ✨ Key Features
* **Adaptive Interviewing:** Dynamic questioning logic that adjusts based on real-time user input.
* **Unbiased Logic:** A recommendation engine focused on technical specifications and user fit over marketing bias.
* **Hybrid Architecture:** Powered by a **TypeScript** frontend and **Python**-driven AI logic.
* **Vite-Powered UI:** Fast, modern development and build process.

---

## 📂 Project Structure
* `/app/applet`: Primary frontend user interface and interaction components.
* `/byefrust_ai`: Core Python services handling AI processing and algorithms.
* `/src`: Shared utilities, types, and logic.
* `generate_products.js`: Utility script for data ingestion or generating product mocks.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher)
* **Python** (3.9 or higher)
* **Package Manager:** npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/gokulwandhare7283-ctrl/ByeFrust-AI.git](https://github.com/gokulwandhare7283-ctrl/ByeFrust-AI.git)
    cd ByeFrust-AI
    ```

2.  **Environment Setup:**
    Create a `.env` file based on the example:
    ```bash
    cp .env.example .env
    ```
    *Open the `.env` file and add your required AI API keys.*

3.  **Install Dependencies:**
    ```bash
    # Install Node.js dependencies
    npm install

    # Install Python dependencies
    pip install -r requirements.txt
    ```

4.  **Launch the Development Server:**
    ```bash
    npm run dev
    ```

---

## 🛠️ Configuration
* `vite.config.ts`: Configuration for the Vite build tool and development server.
* `tsconfig.json`: TypeScript compiler settings.
* `metadata.json`: Stores configuration data for product categories or AI behavior weights.

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
