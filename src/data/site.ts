export type Locale = "zh" | "en";

export type NavItem = {
  label: string;
  href: string;
};

export type Hero = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
};

export type Topic = {
  name: string;
  description: string;
};

export type HighlightItem = {
  title: string;
  description: string;
  href: string;
  meta: string;
  publishedAt?: string;
  cover?: {
    src: string;
    alt: string;
  };
  logo?: {
    src: string;
    alt: string;
  };
  highlights?: string[];
};

export type WritingGroup = {
  name: string;
  description: string;
  items: HighlightItem[];
};

export type SiteContent = {
  siteTitle: string;
  siteDescription: string;
  homePath: string;
  oppositeLocale: {
    label: string;
    href: string;
  };
  nav: NavItem[];
  hero: Hero;
  sections: {
    topicsTitle: string;
    topicsIntro: string;
    booksTitle: string;
    booksIntro: string;
    projectsTitle: string;
    projectsIntro: string;
    writingTitle: string;
    writingIntro: string;
    connectTitle: string;
    connectIntro: string;
  };
  topics: Topic[];
  books: HighlightItem[];
  projects: HighlightItem[];
  writings: HighlightItem[];
  writingGroups: WritingGroup[];
  connect: HighlightItem[];
  footer: string;
};

const sharedBooks = {
  zh: [
    {
      title: "AI 编程的第一性原理",
      description: "从模型行为、Agent 执行、记忆与上下文，到可验证的工程闭环，系统推导 AI 编程如何从生成走向交付。",
      href: "https://caozhiyi.cc/ai-programming-book/",
      meta: "Book · AI Systems",
      cover: {
        src: "/images/books/ai-programming-book-zh.svg",
        alt: "《AI 编程的第一性原理》封面"
      }
    },
    {
      title: "云网络：从隔离到连接",
      description: "从孤立边界到全局联通，沿着物理网络、多租户隔离、VPC、公网连接与混合云，把网络演进讲成一条连续主线。",
      href: "https://caozhiyi.cc/network-book/",
      meta: "Book · Cloud Networking",
      cover: {
        src: "/images/books/network-book-zh.svg",
        alt: "《云网络：从隔离到连接》封面"
      }
    },
    {
      title: "深入解析 QUIC 与 HTTP/3",
      description: "不是 RFC 摘要，而是把 QUIC 与 HTTP/3 的协议约束落实到工程结构里，理解连接、恢复、拥塞控制与实现取舍。",
      href: "https://caozhiyi.cc/quicx-book/",
      meta: "Book · Protocol & Implementation",
      cover: {
        src: "/images/books/quicx-book-zh.svg",
        alt: "《深入解析 QUIC 与 HTTP/3》封面"
      }
    }
  ],
  en: [
    {
      title: "First Principles of AI Coding",
      description: "A systems-first path from model behavior and agent execution to memory, context, and verifiable engineering loops.",
      href: "https://caozhiyi.cc/ai-programming-book/",
      meta: "Book · AI Systems",
      cover: {
        src: "/images/books/ai-programming-book-en.svg",
        alt: "Cover of First Principles of AI Coding"
      }
    },
    {
      title: "Cloud Networking: From Isolation to Connectivity",
      description: "A long-form account of how networking evolves from isolated boundaries to global connectivity through VPC, Internet access, and hybrid cloud.",
      href: "https://caozhiyi.cc/network-book/",
      meta: "Book · Cloud Networking",
      cover: {
        src: "/images/books/network-book-en.svg",
        alt: "Cover of Cloud Networking: From Isolation to Connectivity"
      }
    },
    {
      title: "Inside QUIC and HTTP/3",
      description: "Not an RFC summary, but a protocol-engineering view of how QUIC and HTTP/3 constraints become implementation structure.",
      href: "https://caozhiyi.cc/quicx-book/",
      meta: "Book · Protocol & Implementation",
      cover: {
        src: "/images/books/quicx-book-en.svg",
        alt: "Cover of Inside QUIC and HTTP/3"
      }
    }
  ] satisfies Record<Locale, HighlightItem[]>
};

const sharedProjects = {
  zh: [
    {
      title: "quicX",
      description: "一个自包含的 C++17 QUIC / HTTP/3 协议栈，从 UDP I/O、TLS 1.3、QUIC 连接与流，到 HTTP/3 路由、QPACK、Server Push、QLog 与指标体系，尽量把协议约束落实为可测试、可观察、可互通的工程结构。",
      href: "https://github.com/caozhiyi/quicX",
      meta: "Open Source · C++17 · QUIC / HTTP/3",
      logo: {
        src: "/images/projects/quicx-logo.png",
        alt: "quicX logo"
      },
      highlights: [
        "覆盖 QUIC v1 / v2、HTTP/3、QPACK、连接迁移、拥塞控制和丢包恢复等核心路径。",
        "内置示例、测试、互通验证、QLog 和运行时指标，用工程手段反复校验协议实现。",
        "适合把 RFC 中的约束、状态机和边界条件拆开，观察它们如何落到真实代码结构里。"
      ]
    },
    {
      title: "CppNet",
      description: "一个基于 C++11 的跨平台 TCP 异步网络库，采用 Proactor 风格和多线程事件驱动模型，围绕少量接口、异步回调、连接内存池、时间轮定时器和清晰分层，沉淀网络库基础设施的工程经验。",
      href: "https://github.com/caozhiyi/CppNet",
      meta: "Open Source · C++11 · TCP Networking",
      logo: {
        src: "/images/projects/cppnet-logo.png",
        alt: "CppNet logo"
      },
      highlights: [
        "底层适配 epoll、wepoll 和 kqueue，支持 Linux、Windows 与 macOS。",
        "结构分为事件驱动层、会话管理层和接口层，通过回调向上通知，保持模块边界清楚。",
        "提供 echo、HTTP、sendfile、pingpong、RPC、多端口监听等示例，用小接口承载常见网络编程场景。"
      ]
    }
  ],
  en: [
    {
      title: "quicX",
      description: "A self-contained C++17 QUIC and HTTP/3 stack that turns protocol constraints into testable implementation structure, spanning UDP I/O, TLS 1.3, QUIC streams, HTTP/3 routing, QPACK, server push, QLog, metrics, and interop validation.",
      href: "https://github.com/caozhiyi/quicX",
      meta: "Open Source · C++17 · QUIC / HTTP/3",
      logo: {
        src: "/images/projects/quicx-logo.png",
        alt: "quicX logo"
      },
      highlights: [
        "Covers QUIC v1 / v2, HTTP/3, QPACK, connection migration, congestion control, and loss recovery paths.",
        "Ships examples, tests, interop reports, QLog tracing, and runtime metrics to make protocol behavior observable.",
        "Designed as an engineering lens for reading RFC constraints through concrete state machines and code boundaries."
      ]
    },
    {
      title: "CppNet",
      description: "A cross-platform C++11 asynchronous TCP networking library built around a Proactor-style, multi-threaded event model, small public interfaces, callback-driven I/O, per-connection memory pools, timer wheels, and explicit layering.",
      href: "https://github.com/caozhiyi/CppNet",
      meta: "Open Source · C++11 · TCP Networking",
      logo: {
        src: "/images/projects/cppnet-logo.png",
        alt: "CppNet logo"
      },
      highlights: [
        "Uses epoll, wepoll, and kqueue to support Linux, Windows, and macOS.",
        "Separates event driving, session management, and public interfaces so responsibilities stay clear.",
        "Includes echo, HTTP, sendfile, pingpong, RPC, and multi-port examples for practical networking scenarios."
      ]
    }
  ] satisfies Record<Locale, HighlightItem[]>
};

const sharedWritings = {
  zh: [
    {
      title: "软件吃掉了世界的一半：从规则化到 Token 化的产业轨迹",
      description: "重读“软件吞噬世界”，剖析软件为何只吃掉了世界能被规则化的那一半，以及 Token 化如何为剩下的另一半打开新的产业轨迹。",
      href: "/zh/articles/software-second-half",
      meta: "AI 编程 · 产业趋势",
      publishedAt: "2026-07-04"
    },
    {
      title: "被重新定价的工程师",
      description: "从规则化时代到 Token 化时代，工程师的能力清单正在被市场重新结算：编码实现在贬值，判断力资产在升值。",
      href: "/zh/articles/engineer-repricing",
      meta: "AI 编程 · Career",
      publishedAt: "2026-07-17"
    },
    {
      title: "从 API 网关到 AI 网关：当基础设施被 Token 撑开",
      description: "LLM 调用打破了传统 API 网关“内容黑盒”与“行为确定”的两个前提，催生出新一层承载不确定性的基础设施：AI 网关。",
      href: "/zh/articles/ai-gateway-as-infra",
      meta: "AI 编程 · Infra",
      publishedAt: "2026-07-13"
    },
    {
      title: "它不是低配的人：关于 LLM 智能本身的几个判断",
      description: "实践跑在理论前面，每天被使用的 LLM 依然是没人说得清原理的黑盒。本文从图灵与塞尔的隔代对话、压缩与智能的等价性、涌现与收敛演化等视角，探讨大模型智能的本质及对人类自我定义的重构。",
      href: "/zh/articles/llm-intelligence-blackbox",
      meta: "AI 编程 · 智能本质",
      publishedAt: "2026-06-27"
    },
    {
      title: "《编程者日记（残）》",
      description: "一部科幻视角的工程师日记，从 2023 到 2029，记录了一名技术人在 AI 协作、自驱动与 Agent 化浪潮下的心态变迁。",
      href: "/zh/articles/coding-diary",
      meta: "行业感悟 · Career",
      publishedAt: "2026-05-27"
    },
    {
      title: "你以为在和 AI 聊天，其实是在管理一个有限的文本框",
      description: "深入剖析大模型的上下文窗口、System Prompt 与多轮对话机制，理解如何高效在有限的注意力预算内做信息管理。",
      href: "/zh/articles/ai-chat-is-context-management",
      meta: "AI 编程 · Context",
      publishedAt: "2026-05-22"
    },
    {
      title: "AI 时代的技术新人",
      description: "探讨在 AI 自动生成代码的时代下，技术新人成长路径的改变，以及如何培养真正核心的系统设计与判断力。",
      href: "/zh/articles/ai-area-studying",
      meta: "AI 编程 · Career",
      publishedAt: "2026-05-15"
    },
    {
      title: "在 AI 编程的今天，学好数据结构等基础还有必要吗？",
      description: "探讨有了 AI 辅助编码后，数据结构、算法等底层基础知识对培养程序员核心判断力的意义。",
      href: "/zh/articles/ai-basic-learning",
      meta: "AI 编程 · Foundations",
      publishedAt: "2026-05-29"
    },
    {
      title: "当无聊消失之后",
      description: "从短视频、算法推荐与注意力经济出发，反思信息过载时代对个人注意力与独立判断力的深度塑造。",
      href: "/zh/articles/ai-attention",
      meta: "行业感悟 · Attention",
      publishedAt: "2026-05-23"
    },
    {
      title: "深入理解内存管理",
      description: "从物理内存、虚拟内存、用户态分配器到 C/C++、Rust、Java 与 Go 的运行时回收机制，串联起整条内存管理链路的设计与权衡。",
      href: "/zh/articles/understanding-memory",
      meta: "系统设计 · Memory",
      publishedAt: "2026-04-26"
    },
    {
      title: "为什么我们需要 QUIC",
      description: "知其然也要知其所以然，从 HTTP/1.x、HTTP/2 到 QUIC，剖析用户态协议栈解决队头阻塞、快速握手与连接迁移的必然性。",
      href: "/zh/articles/why-we-need-quic",
      meta: "系统设计 · Networking",
      publishedAt: "2026-03-01"
    },
    {
      title: "浪潮之中：从 Verb Coding 到 AI 协作——一名技术人的反思与重构",
      description: "回望 AI 编程这两年，从粘贴代码、Copilot 到 Agent 协作，聊聊这场技术浪潮带来的反思与思考。",
      href: "/zh/articles/ai-collaboration",
      meta: "AI 编程 · AI 协作",
      publishedAt: "2025-12-14"
    },
    {
      title: "当查询遇到分布式",
      description: "剖析微服务拆分后的列表查询困境，对比并总结 API 聚合、CQRS 与共用存储三种经典设计方案的权衡。",
      href: "/zh/articles/distributed-query",
      meta: "系统设计 · 架构",
      publishedAt: "2025-10-14"
    },
    {
      title: "互联网围城（下）：从技术奴隶到命运抗争",
      description: "在日常积累中掌握可进可退的主动权，理智地面对工作与同事关系，并在莫测的职业发展道路上保持抗争。",
      href: "/zh/articles/slave-to-fate",
      meta: "行业感悟 · Career",
      publishedAt: "2025-06-28"
    },
    {
      title: "互联网围城：学习诅咒与 35 岁断崖的战争",
      description: "站在技术从业者的角度，聊聊互联网的行业特点、学习诅咒、加班成风、以及 35 岁职业危机与跳槽选择。",
      href: "/zh/articles/internet-siege",
      meta: "行业感悟 · Career",
      publishedAt: "2025-06-27"
    },
    {
      title: "如何避免软件腐朽",
      description: "反思为什么代码会不可避免地滑向腐朽的深渊，并讨论在工程设计与测试上如何减缓腐化速度。",
      href: "/zh/articles/avoid-software-decay",
      meta: "系统设计 · 架构",
      publishedAt: "2025-05-10"
    },
    {
      title: "架构实战：数据转换服务",
      description: "以六边形架构为核心，融合责任链与组合模式，设计并落地一个高吞吐量、零硬编码扩展的数据服务。",
      href: "/zh/articles/architecture-practice-data-conversion-service",
      meta: "系统设计 · 架构",
      publishedAt: "2024-12-11"
    },
    {
      title: "软件性能之 CPU",
      description: "从多核、缓存、分支预测等硬件特性出发，探讨如何压榨 CPU 的计算时钟周期。",
      href: "/zh/articles/software-performance-cpu",
      meta: "系统设计 · CPU",
      publishedAt: "2025-05-31"
    },
    {
      title: "软件性能之 IO",
      description: "从磁盘、网络、内存和锁四个维度理解 IO 的性能瓶颈，以及系统设计如何用长板资源补短板。",
      href: "/zh/articles/software-performance-io",
      meta: "系统设计 · IO",
      publishedAt: "2026-04-06"
    },
    {
      title: "大模型是怎么“思考”的",
      description: "从 Token、注意力、自回归生成和采样机制出发，解释大模型在代码场景中为什么会惊艳，也为什么会犯错。",
      href: "/zh/articles/ai-understanding-code-illusion",
      meta: "AI 编程 · LLM",
      publishedAt: "2026-05-20"
    }
  ],
  en: [
    {
      title: "Software Ate Only Half the World: From Rule-Based to Token-Based",
      description: "A long-form reflection on why software has only ever eaten the rule-codifiable half of the world, and how tokens are opening a second industrial track for the other half.",
      href: "/en/articles/software-second-half",
      meta: "AI Coding · Industry",
      publishedAt: "2026-07-04"
    },
    {
      title: "The Repriced Engineer",
      description: "As the industry shifts from rule-based to token-based delivery, the capability bundle of software engineers is being repriced: raw coding depreciates while judgment becomes the new scarce asset.",
      href: "/en/articles/engineer-repricing",
      meta: "AI Coding · Career",
      publishedAt: "2026-07-17"
    },
    {
      title: "From API Gateway to AI Gateway: When Infrastructure Is Stretched by Tokens",
      description: "LLM traffic breaks the two hidden assumptions of the traditional API gateway — opaque payloads and deterministic behavior — and forces a new infrastructure layer that governs non-deterministic calls.",
      href: "/en/articles/ai-gateway-as-infra",
      meta: "AI Coding · Infra",
      publishedAt: "2026-07-13"
    },
    {
      title: "It Is Not a Lesser Human: Notes on What LLMs Actually Are",
      description: "An essay exploring the nature of LLM intelligence through the lens of Turing, Searle, compression theory, and convergent evolution.",
      href: "/en/articles/llm-intelligence-blackbox",
      meta: "AI Coding · Intelligence",
      publishedAt: "2026-06-27"
    },
    {
      title: "The Developer's Diary (Fragments)",
      description: "A developer diary styled as a sci-fi piece from 2023 to 2029, tracking a programmer's journey through AI collaboration and agent-driven workflows.",
      href: "/en/articles/coding-diary",
      meta: "Reflection · Career",
      publishedAt: "2026-05-27"
    },
    {
      title: "You Think You're Chatting with AI, but You're Managing a Finite Textbox",
      description: "An analysis of LLM context windows, system prompts, and multi-turn conversations to understand how to manage information within a finite attention budget.",
      href: "/en/articles/ai-chat-is-context-management",
      meta: "AI Coding · Context",
      publishedAt: "2026-05-22"
    },
    {
      title: "Technical Beginners in the AI Era",
      description: "A reflection on how AI affects the growth path of junior developers, and how to cultivate core judgment and systems thinking.",
      href: "/en/articles/ai-area-studying",
      meta: "AI Coding · Career",
      publishedAt: "2026-05-15"
    },
    {
      title: "Should We Still Learn CS Foundations in the Age of AI Coding?",
      description: "An examination of why foundational CS topics like data structures remain critical for developer judgment in the AI era.",
      href: "/en/articles/ai-basic-learning",
      meta: "AI Coding · Foundations",
      publishedAt: "2026-05-29"
    },
    {
      title: "When Boredom Disappears",
      description: "An exploration of recommendation algorithms, the attention economy, and how constant stimulation shapes our judgment and focus.",
      href: "/en/articles/ai-attention",
      meta: "Reflection · Attention",
      publishedAt: "2026-05-23"
    },
    {
      title: "Understanding Memory Management",
      description: "A deep dive into memory management from physical and virtual memory to user-space allocators and runtime GC designs across C/C++, Rust, Java, and Go.",
      href: "/en/articles/understanding-memory",
      meta: "Systems · Memory",
      publishedAt: "2026-04-26"
    },
    {
      title: "Why We Need QUIC",
      description: "An explanation of the evolution from HTTP/1.x and HTTP/2 to QUIC, analyzing why we need user-space protocols to solve head-of-line blocking, achieve zero-RTT handshake, and support connection migration.",
      href: "/en/articles/why-we-need-quic",
      meta: "Systems · Networking",
      publishedAt: "2026-03-01"
    },
    {
      title: "Inside the Wave: From Verb Coding to AI Collaboration",
      description: "A reflection on the evolution of AI coding from chatbots and Copilots to autonomous agents, and what it means for developers.",
      href: "/en/articles/ai-collaboration",
      meta: "AI Coding · AI",
      publishedAt: "2025-12-14"
    },
    {
      title: "When Query Meets Distributed",
      description: "An examination of list querying challenges in microservices, detailing the trade-offs between API composition, CQRS, and shared database patterns.",
      href: "/en/articles/distributed-query",
      meta: "Systems · Design",
      publishedAt: "2025-10-14"
    },
    {
      title: "Avoiding Software Decay",
      description: "A reflection on why code inevitably slides into decay, and engineering strategies to mitigate technical debt.",
      href: "/en/articles/avoid-software-decay",
      meta: "Systems · Architecture",
      publishedAt: "2025-05-10"
    },
    {
      title: "Architecture Practice: Data Conversion Service",
      description: "Designing and building a high-throughput, zero-hardcoding extensible data service based on hexagonal architecture, chain of responsibility, and composite patterns.",
      href: "/en/articles/architecture-practice-data-conversion-service",
      meta: "Systems · Design",
      publishedAt: "2024-12-11"
    },
    {
      title: "Software Performance: CPU",
      description: "An exploration of CPU hardware traits like multi-core execution, cache lines, and branch prediction, and how to optimize computational execution.",
      href: "/en/articles/software-performance-cpu",
      meta: "Systems · CPU",
      publishedAt: "2025-05-31"
    },
    {
      title: "Software Performance: IO",
      description: "An exploration of IO bottlenecks across disk, network, memory, and locks, and how system design trades long resources for short ones.",
      href: "/en/articles/software-performance-io",
      meta: "Systems · IO",
      publishedAt: "2026-04-06"
    },
    {
      title: "How Large Models “Think”",
      description: "An explanation of tokens, attention, autoregressive generation, sampling, and why LLMs can be both impressive and unreliable in coding work.",
      href: "/en/articles/ai-understanding-code-illusion",
      meta: "AI Coding · LLM",
      publishedAt: "2026-05-20"
    }
  ] satisfies Record<Locale, HighlightItem[]>
};

const sharedWritingGroups = {
  zh: [
    {
      name: "系统设计",
      description: "从抽象、性能、内存和 IO 等底层约束出发，理解系统如何被组织起来。",
      items: [
          {
                title: "深入理解内存管理",
                description: "从物理内存、虚拟内存、用户态分配器到 C/C++、Rust、Java 与 Go 的运行时回收机制，串联起整条内存管理链路的设计与权衡。",
                href: "/zh/articles/understanding-memory",
                meta: "系统设计 · Memory",
                publishedAt: "2026-04-26"
              },
          {
                title: "为什么我们需要 QUIC",
                description: "知其然也要知其所以然，从 HTTP/1.x、HTTP/2 到 QUIC，剖析用户态协议栈解决队头阻塞、快速握手与连接迁移的必然性。",
                href: "/zh/articles/why-we-need-quic",
                meta: "系统设计 · Networking",
                publishedAt: "2026-03-01"
              },
          {
                title: "面向对象编程",
                description: "从软件危机、抽象、SOLID 原则到设计模式，重新理解面向对象为什么出现，以及它真正解决了什么问题。",
                href: "/zh/articles/object-oriented-programming",
                meta: "系统设计 · OOP",
                publishedAt: "2025-08-17"
              },
          {
                title: "深入剖析网络 IO 复用",
                description: "从 socket、非阻塞调用、select/poll 到 epoll、线程模型和缓存组织，拆解高性能网络编程的底层机制。",
                href: "/zh/articles/network-io-multiplexing",
                meta: "系统设计 · Networking",
                publishedAt: "2025-06-08"
              },
          {
                title: "软件性能之 CPU",
                description: "从多核、缓存、分支预测等硬件特性出发，探讨如何压榨 CPU 的计算时钟周期。",
                href: "/zh/articles/software-performance-cpu",
                meta: "系统设计 · CPU",
                publishedAt: "2025-05-31"
              },
          {
                title: "软件性能之 IO",
                description: "从磁盘、网络、内存和锁四个维度理解 IO 的性能瓶颈，以及系统设计如何用长板资源补短板。",
                href: "/zh/articles/software-performance-io",
                meta: "系统设计 · Performance",
                publishedAt: "2026-04-06"
              },
          {
                title: "架构实战：数据转换服务",
                description: "以六边形架构为核心，融合责任链与组合模式，设计并落地一个高吞吐量、零硬编码扩展的数据服务。",
                href: "/zh/articles/architecture-practice-data-conversion-service",
                meta: "系统设计 · 架构",
                publishedAt: "2024-12-11"
              },
          {
                title: "如何避免软件腐朽",
                description: "反思为什么代码会不可避免地滑向腐朽的深渊，并讨论在工程设计与测试上如何减缓腐化速度。",
                href: "/zh/articles/avoid-software-decay",
                meta: "系统设计 · 架构",
                publishedAt: "2025-05-10"
              },
          {
                title: "当查询遇到分布式",
                description: "剖析微服务拆分后的列表查询困境，对比并总结 API 聚合、CQRS 与共用存储三种经典设计方案的权衡。",
                href: "/zh/articles/distributed-query",
                meta: "系统设计 · 架构",
                publishedAt: "2025-10-14"
              }
      ]
    },
    {
      name: "AI 编程",
      description: "围绕大模型、上下文、工具调用与工程闭环，记录 AI 编程系统背后的真实机制。",
      items: [
          {
                title: "软件吃掉了世界的一半：从规则化到 Token 化的产业轨迹",
                description: "重读“软件吞噬世界”，剖析软件为何只吃掉了世界能被规则化的那一半，以及 Token 化如何为剩下的另一半打开新的产业轨迹。",
                href: "/zh/articles/software-second-half",
                meta: "AI 编程 · 产业趋势",
                publishedAt: "2026-07-04"
              },
          {
                title: "被重新定价的工程师",
                description: "从规则化时代到 Token 化时代，工程师的能力清单正在被市场重新结算：编码实现在贬值，判断力资产在升值。",
                href: "/zh/articles/engineer-repricing",
                meta: "AI 编程 · Career",
                publishedAt: "2026-07-17"
              },
          {
                title: "从 API 网关到 AI 网关：当基础设施被 Token 撑开",
                description: "LLM 调用打破了传统 API 网关“内容黑盒”与“行为确定”的两个前提，催生出新一层承载不确定性的基础设施：AI 网关。",
                href: "/zh/articles/ai-gateway-as-infra",
                meta: "AI 编程 · Infra",
                publishedAt: "2026-07-13"
              },
          {
                title: "它不是低配的人：关于 LLM 智能本身的几个判断",
                description: "实践跑在理论前面，每天被使用的 LLM 依然是没人说得清原理的黑盒。本文从图灵与塞尔的隔代对话、压缩与智能的等价性、涌现与收敛演化等视角，探讨大模型智能的本质及对人类自我定义的重构。",
                href: "/zh/articles/llm-intelligence-blackbox",
                meta: "AI 编程 · 智能本质",
                publishedAt: "2026-06-27"
              },
          {
                title: "你以为在和 AI 聊天，其实是在管理一个有限的文本框",
                description: "深入剖析大模型的上下文窗口、System Prompt 与多轮对话机制，理解如何高效在有限的注意力预算内做信息管理。",
                href: "/zh/articles/ai-chat-is-context-management",
                meta: "AI 编程 · Context",
                publishedAt: "2026-05-22"
              },
          {
                title: "AI 时代的技术新人",
                description: "探讨在 AI 自动生成代码的时代下，技术新人成长路径的改变，以及如何培养真正核心的系统设计与判断力。",
                href: "/zh/articles/ai-area-studying",
                meta: "AI 编程 · Career",
                publishedAt: "2026-05-15"
              },
          {
                title: "在 AI 编程的今天，学好数据结构等基础还有必要吗？",
                description: "探讨有了 AI 辅助编码后，数据结构、算法等底层基础知识对培养程序员核心判断力的意义。",
                href: "/zh/articles/ai-basic-learning",
                meta: "AI 编程 · Foundations",
                publishedAt: "2026-05-29"
              },
          {
                title: "大模型是怎么“思考”的",
                description: "从 Token、注意力、自回归生成和采样机制出发，解释大模型在代码场景中为什么会惊艳，也为什么会犯错。",
                href: "/zh/articles/ai-understanding-code-illusion",
                meta: "AI 编程 · LLM",
                publishedAt: "2026-05-20"
              },
          {
                title: "浪潮之中：从 Verb Coding 到 AI 协作——一名技术人的反思与重构",
                description: "回望 AI 编程这两年，从粘贴代码、Copilot 到 Agent 协作，聊聊这场技术浪潮带来的反思与思考。",
                href: "/zh/articles/ai-collaboration",
                meta: "AI 编程 · AI 协作",
                publishedAt: "2025-12-14"
              }
      ]
    },
    {
      name: "行业感悟",
      description: "关于技术管理、工程师成长和团队协作的长期观察。",
      items: [
          {
                title: "《编程者日记（残）》",
                description: "一部科幻视角的工程师日记，从 2023 到 2029，记录了一名技术人在 AI 协作、自驱动与 Agent 化浪潮下的心态变迁。",
                href: "/zh/articles/coding-diary",
                meta: "行业感悟 · Career",
                publishedAt: "2026-05-27"
              },
          {
                title: "当无聊消失之后",
                description: "从短视频、算法推荐与注意力经济出发，反思信息过载时代对个人注意力与独立判断力的深度塑造。",
                href: "/zh/articles/ai-attention",
                meta: "行业感悟 · Attention",
                publishedAt: "2026-05-23"
              },
          {
                title: "如何做好一个技术 Leader",
                description: "围绕第三驱动力、以身作则、建立私交和团队氛围，整理一线技术管理中的经验与取舍。",
                href: "/zh/articles/leader",
                meta: "行业感悟 · Leadership",
                publishedAt: "2025-01-15"
              },
          {
                title: "互联网围城：学习诅咒与 35 岁断崖的战争",
                description: "站在技术从业者的角度，聊聊互联网的行业特点、学习诅咒、加班成风、以及 35 岁职业危机与跳槽选择。",
                href: "/zh/articles/internet-siege",
                meta: "行业感悟 · Career",
                publishedAt: "2025-06-27"
              },
          {
                title: "互联网围城（下）：从技术奴隶到命运抗争",
                description: "在日常积累中掌握可进可退的主动权，理智地面对工作与同事关系，并在莫测的职业发展道路上保持抗争。",
                href: "/zh/articles/slave-to-fate",
                meta: "行业感悟 · Career",
                publishedAt: "2025-06-28"
              }
      ]
    },
    {
      name: "其他",
      description: "暂时不归入固定专题，但后续可以继续扩展的写作入口。",
      items: [
          
      ]
    }
  ],
  en: [
    {
      name: "Systems Design",
      description: "Essays on abstraction, performance, memory, IO, and the constraints that shape software systems.",
      items: [
          {
                title: "Understanding Memory Management",
                description: "A deep dive into memory management from physical and virtual memory to user-space allocators and runtime GC designs across C/C++, Rust, Java, and Go.",
                href: "/en/articles/understanding-memory",
                meta: "Systems · Memory",
                publishedAt: "2026-04-26"
              },
          {
                title: "Why We Need QUIC",
                description: "An explanation of the evolution from HTTP/1.x and HTTP/2 to QUIC, analyzing why we need user-space protocols to solve head-of-line blocking, achieve zero-RTT handshake, and support connection migration.",
                href: "/en/articles/why-we-need-quic",
                meta: "Systems · Networking",
                publishedAt: "2026-03-01"
              },
          {
                title: "Object-Oriented Programming",
                description: "A reflection on OOP through the software crisis, abstraction, SOLID principles, and design patterns.",
                href: "/en/articles/object-oriented-programming",
                meta: "Systems · OOP",
                publishedAt: "2025-08-17"
              },
          {
                title: "Network IO Multiplexing",
                description: "An exploration of sockets, non-blocking IO, select/poll, epoll, threading models, and buffer organization.",
                href: "/en/articles/network-io-multiplexing",
                meta: "Systems · Networking",
                publishedAt: "2025-06-08"
              },
          {
                title: "Software Performance: CPU",
                description: "An exploration of CPU hardware traits like multi-core execution, cache lines, and branch prediction, and how to optimize computational execution.",
                href: "/en/articles/software-performance-cpu",
                meta: "Systems · CPU",
                publishedAt: "2025-05-31"
              },
          {
                title: "Software Performance: IO",
                description: "An exploration of IO bottlenecks across disk, network, memory, and locks, and how system design trades long resources for short ones.",
                href: "/en/articles/software-performance-io",
                meta: "Systems · Performance",
                publishedAt: "2026-04-06"
              },
          {
                title: "Architecture Practice: Data Conversion Service",
                description: "Designing and building a high-throughput, zero-hardcoding extensible data service based on hexagonal architecture, chain of responsibility, and composite patterns.",
                href: "/en/articles/architecture-practice-data-conversion-service",
                meta: "Systems · Design",
                publishedAt: "2024-12-11"
              },
          {
                title: "Avoiding Software Decay",
                description: "A reflection on why code inevitably slides into decay, and engineering strategies to mitigate technical debt.",
                href: "/en/articles/avoid-software-decay",
                meta: "Systems · Architecture",
                publishedAt: "2025-05-10"
              },
          {
                title: "When Query Meets Distributed",
                description: "An examination of list querying challenges in microservices, detailing the trade-offs between API composition, CQRS, and shared database patterns.",
                href: "/en/articles/distributed-query",
                meta: "Systems · Design",
                publishedAt: "2025-10-14"
              }
      ]
    },
    {
      name: "AI Coding",
      description: "Essays on large models, context, tool use, and the engineering loops behind AI coding systems.",
      items: [
          {
                title: "Software Ate Only Half the World: From Rule-Based to Token-Based",
                description: "A long-form reflection on why software has only ever eaten the rule-codifiable half of the world, and how tokens are opening a second industrial track for the other half.",
                href: "/en/articles/software-second-half",
                meta: "AI Coding · Industry",
                publishedAt: "2026-07-04"
              },
          {
                title: "The Repriced Engineer",
                description: "As the industry shifts from rule-based to token-based delivery, the capability bundle of software engineers is being repriced: raw coding depreciates while judgment becomes the new scarce asset.",
                href: "/en/articles/engineer-repricing",
                meta: "AI Coding · Career",
                publishedAt: "2026-07-17"
              },
          {
                title: "From API Gateway to AI Gateway: When Infrastructure Is Stretched by Tokens",
                description: "LLM traffic breaks the two hidden assumptions of the traditional API gateway — opaque payloads and deterministic behavior — and forces a new infrastructure layer that governs non-deterministic calls.",
                href: "/en/articles/ai-gateway-as-infra",
                meta: "AI Coding · Infra",
                publishedAt: "2026-07-13"
              },
          {
                title: "It Is Not a Lesser Human: Notes on What LLMs Actually Are",
                description: "An essay exploring the nature of LLM intelligence through the lens of Turing, Searle, compression theory, and convergent evolution.",
                href: "/en/articles/llm-intelligence-blackbox",
                meta: "AI Coding · Intelligence",
                publishedAt: "2026-06-27"
              },
          {
                title: "You Think You're Chatting with AI, but You're Managing a Finite Textbox",
                description: "An analysis of LLM context windows, system prompts, and multi-turn conversations to understand how to manage information within a finite attention budget.",
                href: "/en/articles/ai-chat-is-context-management",
                meta: "AI Coding · Context",
                publishedAt: "2026-05-22"
              },
          {
                title: "Technical Beginners in the AI Era",
                description: "A reflection on how AI affects the growth path of junior developers, and how to cultivate core judgment and systems thinking.",
                href: "/en/articles/ai-area-studying",
                meta: "AI Coding · Career",
                publishedAt: "2026-05-15"
              },
          {
                title: "Should We Still Learn CS Foundations in the Age of AI Coding?",
                description: "An examination of why foundational CS topics like data structures remain critical for developer judgment in the AI era.",
                href: "/en/articles/ai-basic-learning",
                meta: "AI Coding · Foundations",
                publishedAt: "2026-05-29"
              },
          {
                title: "How Large Models “Think”",
                description: "An explanation of tokens, attention, autoregressive generation, sampling, and why LLMs can be both impressive and unreliable in coding work.",
                href: "/en/articles/ai-understanding-code-illusion",
                meta: "AI Coding · LLM",
                publishedAt: "2026-05-20"
              },
          {
                title: "Inside the Wave: From Verb Coding to AI Collaboration",
                description: "A reflection on the evolution of AI coding from chatbots and Copilots to autonomous agents, and what it means for developers.",
                href: "/en/articles/ai-collaboration",
                meta: "AI Coding · AI",
                publishedAt: "2025-12-14"
              }
      ]
    },
    {
      name: "Industry Reflections",
      description: "Essays on engineering leadership, team work, and long-term technical judgment.",
      items: [
          {
                title: "The Developer's Diary (Fragments)",
                description: "A developer diary styled as a sci-fi piece from 2023 to 2029, tracking a programmer's journey through AI collaboration and agent-driven workflows.",
                href: "/en/articles/coding-diary",
                meta: "Reflection · Career",
                publishedAt: "2026-05-27"
              },
          {
                title: "When Boredom Disappears",
                description: "An exploration of recommendation algorithms, the attention economy, and how constant stimulation shapes our judgment and focus.",
                href: "/en/articles/ai-attention",
                meta: "Reflection · Attention",
                publishedAt: "2026-05-23"
              }
      ]
    },
    {
      name: "Other",
      description: "A placeholder category for writing that does not yet belong to a fixed topic.",
      items: [
          
      ]
    }
  ] satisfies Record<Locale, WritingGroup[]>
};

const sharedConnect = {
  zh: [
    {
      title: "GitHub",
      description: "查看开源项目、文档和持续更新。",
      href: "https://github.com/caozhiyi",
      meta: "Profile"
    },
    {
      title: "公众号：煮码宝藏",
      description: "围绕工程实践、系统设计与技术写作持续输出。",
      href: "/zh/about/",
      meta: "Writing Channel"
    }
  ],
  en: [
    {
      title: "GitHub",
      description: "Browse the open-source repositories, documentation, and ongoing work.",
      href: "https://github.com/caozhiyi",
      meta: "Profile"
    },
    {
      title: "Writing and long-form essays",
      description: "This site serves as the front door for long-form technical work, books, and project context.",
      href: "/en/about/",
      meta: "Author Profile"
    }
  ] satisfies Record<Locale, HighlightItem[]>
};

export const siteContent: Record<Locale, SiteContent> = {
  zh: {
    siteTitle: "曹智轶",
    siteDescription: "代码、书籍与长期写作",
    homePath: "/zh/",
    oppositeLocale: {
      label: "EN",
      href: "/en/"
    },
    nav: [
      { label: "首页", href: "/zh/" },
      { label: "书", href: "/zh/books/" },
      { label: "项目", href: "/zh/projects/" },
      { label: "文章", href: "/zh/articles/" },
      { label: "关于", href: "/zh/about/" }
    ],
    hero: {
      eyebrow: "A personal hub for books, projects, and technical writing.",
      title: "What I cannot create, I do not understand.",
      description: "将复杂的现实逻辑沉淀为可运行的代码，书籍以及写作，在持之以恒的创造中探寻技术本质。",
      primaryCta: {
        label: "先看书",
        href: "/zh/books/"
      },
      secondaryCta: {
        label: "查看项目",
        href: "/zh/projects/"
      }
    },
    sections: {
      topicsTitle: "主题方向",
      topicsIntro: "站点描述保持通用，但这里会持续呈现我当前最关心的问题域。",
      booksTitle: "书",
      booksIntro: "系统化内容会继续保留独立阅读体验，而这个站负责把它们聚合起来。",
      projectsTitle: "项目",
      projectsIntro: "开源项目是长期技术判断力的另一种呈现方式。",
      writingTitle: "写作",
      writingIntro: "文章区会逐步汇总代表性文章、专题和阅读路径。",
      connectTitle: "连接我",
      connectIntro: "如果你想继续跟进这些主题，可以从这里进入。"
    },
    topics: [
      {
        name: "Systems",
        description: "从约束、抽象和边界出发理解复杂系统。"
      },
      {
        name: "Networking",
        description: "从网络协议、云网络到流量治理。"
      },
      {
        name: "Protocol Engineering",
        description: "把协议规范翻译成工程实现与调试能力。"
      },
      {
        name: "AI-Assisted Development",
        description: "关注 AI 编程系统背后的原理、架构和工程方法。"
      }
    ],
    books: sharedBooks.zh,
    projects: sharedProjects.zh,
    writings: sharedWritings.zh,
    writingGroups: sharedWritingGroups.zh,
    connect: sharedConnect.zh,
    footer: "Built with Astro as the front door for books, projects, and technical writing."
  },
  en: {
    siteTitle: "Zhiyi Cao",
    siteDescription: "Code, Books & Long-form Writing",
    homePath: "/en/",
    oppositeLocale: {
      label: "中文",
      href: "/zh/"
    },
    nav: [
      { label: "Home", href: "/en/" },
      { label: "Books", href: "/en/books/" },
      { label: "Projects", href: "/en/projects/" },
      { label: "Writing", href: "/en/articles/" },
      { label: "About", href: "/en/about/" }
    ],
    hero: {
      eyebrow: "A personal hub for books, projects, and technical writing.",
      title: "What I cannot create, I do not understand.",
      description: "Turning complex real-world logic into runnable code, books, and writing, seeking the truth of technology through relentless creation.",
      primaryCta: {
        label: "Explore books",
        href: "/en/books/"
      },
      secondaryCta: {
        label: "Browse projects",
        href: "/en/projects/"
      }
    },
    sections: {
      topicsTitle: "Current topics",
      topicsIntro: "The site description stays broad on purpose, while the active themes remain visible here.",
      booksTitle: "Books",
      booksIntro: "Long-form work keeps its own reading experience, and this site ties the tracks together.",
      projectsTitle: "Projects",
      projectsIntro: "Open-source work is another way to show long-term technical judgment.",
      writingTitle: "Writing",
      writingIntro: "The writing section will grow into a curated archive of essays, themes, and reading paths.",
      connectTitle: "Find more",
      connectIntro: "Use these entry points to continue following the work."
    },
    topics: [
      {
        name: "Systems",
        description: "Understanding complex systems through constraints, abstractions, and boundaries."
      },
      {
        name: "Networking",
        description: "From protocol mechanics and cloud networking to traffic governance."
      },
      {
        name: "Protocol Engineering",
        description: "Turning specifications into implementation, debugging, and production trade-offs."
      },
      {
        name: "AI-Assisted Development",
        description: "Focusing on the principles, architecture, and engineering workflow behind AI coding systems."
      }
    ],
    books: sharedBooks.en,
    projects: sharedProjects.en,
    writings: sharedWritings.en,
    writingGroups: sharedWritingGroups.en,
    connect: sharedConnect.en,
    footer: "Built with Astro as the front door for books, projects, and technical writing."
  }
};