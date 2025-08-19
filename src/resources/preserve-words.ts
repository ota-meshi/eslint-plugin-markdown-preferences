export const defaultPreserveWords = [
  // Programming Languages
  "JavaScript",
  "TypeScript",
  "ECMAScript",
  "ES6",
  ...(function* () {
    const end = new Date().getFullYear() + 3;
    for (let i = 2015; i <= end; i++) {
      yield `ES${i}`;
    }
  })(),
  "PHP",
  "Python",
  "Java",
  "C#",
  "C++",
  "Rust",
  "Go",
  "go", // Avoid conflict with English "go"
  "Swift",
  "Kotlin",
  "Dart",
  "Ruby",
  "Scala",
  "Perl",
  "R",
  "MATLAB",
  "Lua",
  "Haskell",
  "Elixir",
  "Clojure",
  "F#",
  "OCaml",
  "Zig",
  "V",
  "Nim",
  "Crystal",
  "Gleam",
  "Odin",
  "Carbon",

  // Markup Languages
  "HTML",
  "CSS",
  "Sass",
  "SCSS",
  "Less",
  "Stylus",

  // Data and Document Formats
  "JSON",
  "XML",
  "PDF",
  "CSV",
  "YAML",
  "TOML",
  "Markdown",
  "LaTeX",
  "Parquet",
  "Avro",
  "Protobuf",
  "MessagePack",
  "BSON",
  "HDF5",
  "Apache Arrow",
  "ORC",

  // Query Languages
  "SQL",
  "GraphQL",

  // Frontend Frameworks and Libraries
  "React",
  "Vue",
  "Angular",
  "Redux",
  "Svelte",
  "SvelteKit",
  "Preact",
  "Solid",
  "Alpine.js",
  "Lit",
  "Stencil",
  "Ember.js",
  "Backbone.js",
  "jQuery",
  "D3.js",
  "Three.js",
  "Chart.js",
  "Plotly",
  "Astro",
  "Remix",
  "Qwik",
  "SolidJS",
  "Vike",

  // JavaScript Runtimes and Platforms
  "Node.js",
  "Deno",
  "Bun",
  "Electron",
  "Tauri",

  // Web Frameworks
  "Next.js",
  "Nuxt.js",
  "Gatsby",
  "Express.js",
  "NestJS",
  "FastAPI",
  "Django",
  "Flask",
  "Ruby on Rails",
  "Spring Boot",
  "Laravel",
  "Phoenix",
  "Actix",
  "Axum",
  "Rocket",

  // Mobile Development Frameworks
  "Flutter",
  "React Native",
  "Ionic",
  "Xamarin",
  "Expo",

  // Game Development Engines
  "Unity",
  "Unreal Engine",

  // Development Tools and Utilities
  "ESLint",
  "Prettier",
  "Biome",
  "oxc",
  "swc",
  "markdownlint",

  // Build Tools and Bundlers
  "Webpack",
  "Vite",
  "Babel",
  "Workbox",
  "Rollup",
  "Parcel",
  "esbuild",
  "Turbo",
  "Turborepo",
  "Nx",
  "Lerna",
  "Rush",

  // JavaScript Package Managers
  "npm",
  "yarn",
  "pnpm",
  "bun",
  "bower",

  // Language-Specific Package Managers
  "composer",
  "pip",
  "conda",
  "Maven",
  "Gradle",
  "SBT",
  "Cargo",

  // System Package Managers
  "homebrew",
  "chocolatey",

  // Mobile Package Managers
  "CocoaPods",
  "Carthage",
  "Swift Package Manager",

  // Code Editors
  "VS Code",
  "Visual Studio Code",
  "Vim",
  "Neovim",
  "Emacs",
  "Sublime Text",
  "Atom",
  "Brackets",
  "brackets", // Avoid conflict with English "brackets"

  // Integrated Development Environments (IDEs)
  "Visual Studio",
  "IntelliJ IDEA",
  "WebStorm",
  "PHPStorm",
  "PyCharm",
  "Android Studio",
  "Xcode",

  // Containerization and Orchestration
  "Docker",
  "Kubernetes",
  "Helm",

  // DevOps and Infrastructure
  "CI / CD",
  "DevOps",
  "GitOps",
  "IaC",
  "Infrastructure as Code",
  "SaaS",
  "PaaS",
  "IaaS",
  "CDN",
  "Load Balancer",
  "API Gateway",
  "Microservices",
  "Serverless",
  "Lambda",
  "Cloud Functions",
  "Container Registry",
  "Prometheus",
  "Grafana",
  "Terraform",
  "Ansible",

  // CI/CD Platforms
  "Jenkins",
  "GitHub Actions",
  "GitLab CI",
  "CircleCI",
  "Travis CI",
  "Azure DevOps",
  "TeamCity",
  "Bamboo",
  "Buildkite",
  "Drone CI",

  // Major Cloud Providers
  "AWS",
  "Amazon Web Services",
  "Azure",
  "GCP",
  "Google Cloud Platform",

  // Platform as a Service (PaaS)
  "Heroku",
  "Vercel",
  "Netlify",
  "Railway",
  "Render",
  "Fly.io",

  // Content Delivery and Infrastructure
  "Cloudflare",
  "DigitalOcean",

  // Web APIs and Protocols
  "API",
  "APIs",
  "REST",
  "RESTful",
  "gRPC",
  "HTTP",
  "HTTPS",
  "WebSocket",
  "SOAP",
  "XML-RPC",
  "JSON-RPC",

  // Technical Concepts and Terminology
  "CLI",
  "SDK",
  "URL",
  "URI",
  "UUID",
  "GUID",
  "CRUD",
  "ACID",
  "BASE",
  "CAP Theorem",

  // Security Protocols
  "JWT",
  "OAuth",
  "OAuth2",
  "OpenID Connect",
  "SAML",
  "SSO",
  "MFA",
  "2FA",
  "CORS",
  "CSRF",
  "XSS",

  // Network Protocols
  "SSH",
  "FTP",
  "SFTP",
  "SMTP",
  "IMAP",
  "POP3",
  "TCP",
  "UDP",
  "IP",
  "IPv4",
  "IPv6",
  "DNS",
  "DHCP",
  "VPN",
  "SSL",
  "TLS",
  "LDAP",

  // Relational Databases
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "MariaDB",
  "Oracle",
  "SQL Server",
  "CockroachDB",
  "PlanetScale",
  "Neon",

  // NoSQL Databases
  "NoSQL",
  "MongoDB",
  "DynamoDB",
  "Cassandra",
  "CouchDB",
  "Neo4j",
  "ArangoDB",
  "FaunaDB",
  "Firebase",
  "Supabase",

  // In-Memory Databases and Caches
  "Redis",

  // Search Engines
  "ElasticSearch",
  "Solr",

  // Time Series Databases
  "InfluxDB",
  "TimescaleDB",

  // Database ORMs and Query Builders
  "Prisma",
  "TypeORM",
  "Sequelize",
  "Mongoose",
  "Drizzle",
  "Knex.js",
  "Objection.js",
  "Bookshelf.js",

  // Testing Methodologies
  "QA",
  "QC",
  "TDD",
  "BDD",
  "E2E",
  "Unit Testing",
  "Integration Testing",

  // JavaScript Testing Frameworks
  "Jest",
  "Mocha",
  "Chai",
  "Jasmine",
  "Karma",
  "Vitest",
  "Ava",
  "Tape",

  // End-to-End Testing Tools
  "Cypress",
  "Playwright",
  "Selenium",
  "Puppeteer",
  "WebDriver",
  "TestCafe",

  // Code Quality and Analysis Tools
  "SonarQube",
  "Husky",
  "lint-staged",
  "commitizen",
  "semantic-release",
  "Codecov",
  "CodeClimate",

  // Machine Learning and AI
  "TensorFlow",
  "PyTorch",
  "Keras",
  "Scikit-learn",
  "Pandas",
  "NumPy",
  "OpenCV",
  "Hugging Face",
  "LangChain",
  "OpenAI",
  "Anthropic",
  "Jupyter",
  "MLflow",
  "Weights & Biases",
  "CUDA",
  "ONNX",
  "GPT",
  "BERT",
  "Transformer",
  "Claude",
  "Gemini",
  "LLaMA",
  "Stable Diffusion",
  "DALL-E",
  "Midjourney",
  "AutoML",

  // Data and Analytics
  "ETL",
  "ELT",
  "Big Data",
  "Data Lake",
  "Data Warehouse",
  "OLAP",
  "OLTP",
  "Apache Spark",
  "Apache Kafka",
  "Apache Airflow",
  "Hadoop",
  "Snowflake",
  "Databricks",
  "Tableau",
  "Power BI",
  "Looker",

  // Security Standards and Organizations
  "OWASP",

  // Security Testing Types
  "SAST",
  "DAST",
  "IAST",
  "SCA",
  "Penetration Testing",
  "Vulnerability Assessment",

  // Access Control Models
  "RBAC",
  "ABAC",

  // Security Concepts and Technologies
  "Zero Trust",
  "PKI",
  "HSM",
  "WAF",
  "DDoS",

  // Web Architecture and Concepts
  "PWA",
  "SPA",
  "SSR",
  "SSG",
  "CSR",
  "JAMstack",
  "Headless CMS",
  "Edge Computing",
  "WebAssembly",
  "WASM",
  "Service Worker",
  "Web Components",
  "Micro Frontends",
  "BFF",
  "Backend for Frontend",
  "GraphQL",
  "tRPC",
  "gRPC-Web",
  "WebRTC",
  "WebGL",
  "WebGPU",

  // React UI Component Libraries
  "Material UI",
  "Ant Design",
  "Chakra UI",
  "React Bootstrap",
  "Semantic UI React",
  "Blueprint",
  "Mantine",
  "NextUI",
  "Arco Design",

  // CSS Frameworks
  "Tailwind CSS",
  "Bootstrap",
  "Bulma",
  "Foundation",
  "Semantic UI",
  "Materialize",
  "Spectre.css",
  "Tachyons",
  "PureCSS",

  // CSS-in-JS and Styling Libraries
  "styled-components",
  "CSS-in-JS",
  "Emotion",
  "JSS",
  "Styled System",
  "Stitches",
  "Vanilla Extract",
  "Linaria",
  "Aphrodite",
  "Glamorous",
  "Radium",

  // Version Control Systems
  "Git",
  "Mercurial",
  "SVN",

  // Code Hosting Platforms
  "GitHub",
  "GitLab",
  "Bitbucket",

  // Development Workflow and Collaboration
  "Pull Request",
  "Merge Request",
  "Code Review",
  "Pair Programming",
  "Mob Programming",

  // Documentation and Static Site Generators
  "Docusaurus",
  "GitBook",
  "VitePress",
  "VuePress",
  "Docsify",
  "MkDocs",
  "Sphinx",
  "Jekyll",
  "Hugo",
  "Eleventy",
  "Hexo",
  "Zola",

  // API Documentation Tools
  "Swagger",
  "OpenAPI",
  "Postman",
  "Insomnia",
  "Redoc",
  "Stoplight",

  // Common Words and Phrases
  "FAQ",

  // Products
  "YouTube",
];
