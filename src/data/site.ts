export type Locale = "zh" | "en";

export function getRelativePath(path: string) {
  if (!path) return path;
  if (path.indexOf("http://") === 0 || path.indexOf("https://") === 0 || path.indexOf("mailto:") === 0) {
    return path;
  }
  const meta: any = import.meta;
  const base = (meta && meta.env && meta.env.BASE_URL) || '/';
  const cleanPath = path.indexOf('/') === 0 ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}

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
      href: "https://caozhiyi.github.io/ai-programming-book/",
      meta: "Book · AI Systems",
      cover: {
        src: "/images/books/ai-programming-book-zh.svg",
        alt: "《AI 编程的第一性原理》封面"
      }
    },
    {
      title: "云网络：从隔离到连接",
      description: "从孤立边界到全局联通，沿着物理网络、多租户隔离、VPC、公网连接与混合云，把网络演进讲成一条连续主线。",
      href: "https://caozhiyi.github.io/network-book/",
      meta: "Book · Cloud Networking",
      cover: {
        src: "/images/books/network-book-zh.svg",
        alt: "《云网络：从隔离到连接》封面"
      }
    },
    {
      title: "深入解析 QUIC 与 HTTP/3",
      description: "不是 RFC 摘要，而是把 QUIC 与 HTTP/3 的协议约束落实到工程结构里，理解连接、恢复、拥塞控制与实现取舍。",
      href: "https://caozhiyi.github.io/quicx-book/",
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
      href: "https://caozhiyi.github.io/ai-programming-book/",
      meta: "Book · AI Systems",
      cover: {
        src: "/images/books/ai-programming-book-en.svg",
        alt: "Cover of First Principles of AI Coding"
      }
    },
    {
      title: "Cloud Networking: From Isolation to Connectivity",
      description: "A long-form account of how networking evolves from isolated boundaries to global connectivity through VPC, Internet access, and hybrid cloud.",
      href: "https://caozhiyi.github.io/network-book/",
      meta: "Book · Cloud Networking",
      cover: {
        src: "/images/books/network-book-en.svg",
        alt: "Cover of Cloud Networking: From Isolation to Connectivity"
      }
    },
    {
      title: "Inside QUIC and HTTP/3",
      description: "Not an RFC summary, but a protocol-engineering view of how QUIC and HTTP/3 constraints become implementation structure.",
      href: "https://caozhiyi.github.io/quicx-book/",
      meta: "Book · Protocol & Implementation",
      cover: {
        src: "/images/books/quicx-book-en.svg",
        alt: "Cover of Inside QUIC and HTTP/3"
      }
    }
  ]
} satisfies Record<Locale, HighlightItem[]>;

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
  ]
} satisfies Record<Locale, HighlightItem[]>;

const sharedWritings = {
  zh: [
    {
      title: "《编程者日记（残）》",
      description: "一部科幻视角的工程师日记，从 2023 到 2029，记录了一名技术人在 AI 协作、自驱动与 Agent 化浪潮下的心态变迁。",
      href: "/zh/articles/coding-diary",
      meta: "行业感悟 · Career"
    },
    {
      title: "你以为在和 AI 聊天，其实是在管理一个有限的文本框",
      description: "深入剖析大模型的上下文窗口、System Prompt 与多轮对话机制，理解如何高效在有限的注意力预算内做信息管理。",
      href: "/zh/articles/ai-chat-is-context-management",
      meta: "AI 编程 · Context"
    },
    {
      title: "AI 时代的技术新人",
      description: "探讨在 AI 自动生成代码的时代下，技术新人成长路径的改变，以及如何培养真正核心的系统设计与判断力。",
      href: "/zh/articles/ai-area-studying",
      meta: "AI 编程 · Career"
    },
    {
      title: "在 AI 编程的今天，学好数据结构等基础还有必要吗？",
      description: "探讨有了 AI 辅助编码后，数据结构、算法等底层基础知识对培养程序员核心判断力的意义。",
      href: "/zh/articles/ai-basic-learning",
      meta: "AI 编程 · Foundations"
    },
    {
      title: "当无聊消失之后",
      description: "从短视频、算法推荐与注意力经济出发，反思信息过载时代对个人注意力与独立判断力的深度塑造。",
      href: "/zh/articles/ai-attention",
      meta: "行业感悟 · Attention"
    },
    {
      title: "深入理解内存管理",
      description: "从物理内存、虚拟内存、用户态分配器到 C/C++、Rust、Java 与 Go 的运行时回收机制，串联起整条内存管理链路的设计与权衡。",
      href: "/zh/articles/understanding-memory",
      meta: "系统设计 · Memory"
    },
    {
      title: "为什么我们需要 QUIC",
      description: "知其然也要知其所以然，从 HTTP/1.x、HTTP/2 到 QUIC，剖析用户态协议栈解决队头阻塞、快速握手与连接迁移的必然性。",
      href: "/zh/articles/why-we-need-quic",
      meta: "系统设计 · Networking"
    },
    {
      title: "浪潮之中：从 Verb Coding 到 AI 协作——一名技术人的反思与重构",
      description: "回望 AI 编程这两年，从粘贴代码、Copilot 到 Agent 协作，聊聊这场技术浪潮带来的反思与思考。",
      href: "/zh/articles/ai-collaboration",
      meta: "AI 编程 · AI 协作"
    },
    {
      title: "当查询遇到分布式",
      description: "剖析微服务拆分后的列表查询困境，对比并总结 API 聚合、CQRS 与共用存储三种经典设计方案的权衡。",
      href: "/zh/articles/distributed-query",
      meta: "系统设计 · 架构"
    },
    {
      title: "互联网围城（下）：从技术奴隶到命运抗争",
      description: "在日常积累中掌握可进可退的主动权，理智地面对工作与同事关系，并在莫测的职业发展道路上保持抗争。",
      href: "/zh/articles/slave-to-fate",
      meta: "行业感悟 · Career"
    },
    {
      title: "互联网围城：学习诅咒与 35 岁断崖的战争",
      description: "站在技术从业者的角度，聊聊互联网的行业特点、学习诅咒、加班成风、以及 35 岁职业危机与跳槽选择。",
      href: "/zh/articles/internet-siege",
      meta: "行业感悟 · Career"
    },
    {
      title: "如何避免软件腐朽",
      description: "反思为什么代码会不可避免地滑向腐朽的深渊，并讨论在工程设计与测试上如何减缓腐化速度。",
      href: "/zh/articles/avoid-software-decay",
      meta: "系统设计 · 架构"
    },
    {
      title: "架构实战：数据转换服务",
      description: "以六边形架构为核心，融合责任链与组合模式，设计并落地一个高吞吐量、零硬编码扩展的数据服务。",
      href: "/zh/articles/architecture-practice-data-conversion-service",
      meta: "系统设计 · 架构"
    },
    {
      title: "软件性能之 CPU",
      description: "从多核、缓存、分支预测等硬件特性出发，探讨如何压榨 CPU 的计算时钟周期。",
      href: "/zh/articles/software-performance-cpu",
      meta: "系统设计 · CPU"
    },
    {
      title: "软件性能之 IO",
      description: "从磁盘、网络、内存和锁四个维度理解 IO 的性能瓶颈，以及系统设计如何用长板资源补短板。",
      href: "/zh/articles/software-performance-io",
      meta: "系统设计 · IO"
    },
    {
      title: "大模型是怎么“思考”的",
      description: "从 Token、注意力、自回归生成和采样机制出发，解释大模型在代码场景中为什么会惊艳，也为什么会犯错。",
      href: "/zh/articles/ai-understanding-code-illusion",
      meta: "AI 编程 · LLM"
    }
  ],
  en: [
    {
      title: "The Developer's Diary (Fragments)",
      description: "A Chinese essay styled as a sci-fi developer diary from 2023 to 2029, tracking a programmer's journey through AI collaboration and agent-driven workflows.",
      href: "/en/articles/coding-diary",
      meta: "Reflection · Career"
    },
    {
      title: "You Think You're Chatting with AI, but You're Managing a Finite Textbox",
      description: "A Chinese essay analyzing LLM context windows, system prompts, and multi-turn conversations to understand how to manage information within a finite attention budget.",
      href: "/en/articles/ai-chat-is-context-management",
      meta: "AI Coding · Context"
    },
    {
      title: "Technical Beginners in the AI Era",
      description: "A Chinese essay reflecting on how AI affects the growth path of junior developers, and how to cultivate core judgment and systems thinking.",
      href: "/en/articles/ai-area-studying",
      meta: "AI Coding · Career"
    },
    {
      title: "Should We Still Learn CS Foundations in the Age of AI Coding?",
      description: "A Chinese essay examining why foundational CS topics like data structures remain critical for developer judgment in the AI era.",
      href: "/en/articles/ai-basic-learning",
      meta: "AI Coding · Foundations"
    },
    {
      title: "When Boredom Disappears",
      description: "A Chinese essay exploring recommendation algorithms, the attention economy, and how constant stimulation shapes our judgment and focus.",
      href: "/en/articles/ai-attention",
      meta: "Reflection · Attention"
    },
    {
      title: "Understanding Memory Management",
      description: "A Chinese essay tracing memory management from physical and virtual memory to user-space allocators and runtime GC designs across C/C++, Rust, Java, and Go.",
      href: "/en/articles/understanding-memory",
      meta: "Systems · Memory"
    },
    {
      title: "Why We Need QUIC",
      description: "A Chinese essay explaining the evolution from HTTP/1.x and HTTP/2 to QUIC, analyzing why we need user-space protocols to solve head-of-line blocking, achieve zero-RTT handshake, and support connection migration.",
      href: "/en/articles/why-we-need-quic",
      meta: "Systems · Networking"
    },
    {
      title: "Inside the Wave: From Verb Coding to AI Collaboration",
      description: "A Chinese essay reflecting on the evolution of AI coding from chatbots and Copilots to autonomous agents, and what it means for developers.",
      href: "/en/articles/ai-collaboration",
      meta: "AI Coding · AI"
    },
    {
      title: "When Query Meets Distributed",
      description: "A Chinese essay examining list querying challenges in microservices, detailing the trade-offs between API composition, CQRS, and shared database patterns.",
      href: "/en/articles/distributed-query",
      meta: "Systems · Design"
    },
    {
      title: "Avoiding Software Decay",
      description: "A Chinese essay reflecting on why code inevitably slides into decay, and engineering strategies to mitigate technical debt.",
      href: "/en/articles/avoid-software-decay",
      meta: "Systems · Architecture"
    },
    {
      title: "Architecture Practice: Data Conversion Service",
      description: "A Chinese essay on designing and building a high-throughput, zero-hardcoding extensible data service based on hexagonal architecture, chain of responsibility, and composite patterns.",
      href: "/en/articles/architecture-practice-data-conversion-service",
      meta: "Systems · Design"
    },
    {
      title: "Software Performance: CPU",
      description: "A Chinese essay on CPU hardware traits like multi-core execution, cache lines, and branch prediction, and how to optimize computational execution.",
      href: "/en/articles/software-performance-cpu",
      meta: "Systems · CPU"
    },
    {
      title: "Software Performance: IO",
      description: "A Chinese essay on IO bottlenecks across disk, network, memory, and locks, and how system design trades long resources for short ones.",
      href: "/en/articles/software-performance-io",
      meta: "Systems · IO"
    },
    {
      title: "How Large Models “Think”",
      description: "A Chinese essay on tokens, attention, autoregressive generation, sampling, and why LLMs can be both impressive and unreliable in coding work.",
      href: "/en/articles/ai-understanding-code-illusion",
      meta: "AI Coding · LLM"
    }
  ]
} satisfies Record<Locale, HighlightItem[]>;

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
                meta: "系统设计 · Memory"
              },
          {
                title: "为什么我们需要 QUIC",
                description: "知其然也要知其所以然，从 HTTP/1.x、HTTP/2 到 QUIC，剖析用户态协议栈解决队头阻塞、快速握手与连接迁移的必然性。",
                href: "/zh/articles/why-we-need-quic",
                meta: "系统设计 · Networking"
              },
          {
                title: "面向对象编程",
                description: "从软件危机、抽象、SOLID 原则到设计模式，重新理解面向对象为什么出现，以及它真正解决了什么问题。",
                href: "/zh/articles/object-oriented-programming",
                meta: "系统设计 · OOP"
              },
          {
                title: "深入剖析网络 IO 复用",
                description: "从 socket、非阻塞调用、select/poll 到 epoll、线程模型和缓存组织，拆解高性能网络编程的底层机制。",
                href: "/zh/articles/network-io-multiplexing",
                meta: "系统设计 · Networking"
              },
          {
                title: "软件性能之 CPU",
                description: "从多核、缓存、分支预测等硬件特性出发，探讨如何压榨 CPU 的计算时钟周期。",
                href: "/zh/articles/software-performance-cpu",
                meta: "系统设计 · CPU"
              },
          {
                title: "软件性能之 IO",
                description: "从磁盘、网络、内存和锁四个维度理解 IO 的性能瓶颈，以及系统设计如何用长板资源补短板。",
                href: "/zh/articles/software-performance-io",
                meta: "系统设计 · Performance"
              },
          {
                title: "架构实战：数据转换服务",
                description: "以六边形架构为核心，融合责任链与组合模式，设计并落地一个高吞吐量、零硬编码扩展的数据服务。",
                href: "/zh/articles/architecture-practice-data-conversion-service",
                meta: "系统设计 · 架构"
              },
          {
                title: "如何避免软件腐朽",
                description: "反思为什么代码会不可避免地滑向腐朽的深渊，并讨论在工程设计与测试上如何减缓腐化速度。",
                href: "/zh/articles/avoid-software-decay",
                meta: "系统设计 · 架构"
              },
          {
                title: "当查询遇到分布式",
                description: "剖析微服务拆分后的列表查询困境，对比并总结 API 聚合、CQRS 与共用存储三种经典设计方案的权衡。",
                href: "/zh/articles/distributed-query",
                meta: "系统设计 · 架构"
              }
      ]
    },
    {
      name: "AI 编程",
      description: "围绕大模型、上下文、工具调用与工程闭环，记录 AI 编程系统背后的真实机制。",
      items: [
          {
                title: "你以为在和 AI 聊天，其实是在管理一个有限的文本框",
                description: "深入剖析大模型的上下文窗口、System Prompt 与多轮对话机制，理解如何高效在有限的注意力预算内做信息管理。",
                href: "/zh/articles/ai-chat-is-context-management",
                meta: "AI 编程 · Context"
              },
          {
                title: "AI 时代的技术新人",
                description: "探讨在 AI 自动生成代码的时代下，技术新人成长路径 of 改变，以及如何培养真正核心的系统设计与判断力。",
                href: "/zh/articles/ai-area-studying",
                meta: "AI 编程 · Career"
              },
          {
                title: "在 AI 编程的今天，学好数据结构等基础还有必要吗？",
                description: "探讨有了 AI 辅助编码后，数据结构、算法等底层基础知识对培养程序员核心判断力的意义。",
                href: "/zh/articles/ai-basic-learning",
                meta: "AI 编程 · Foundations"
              },
          {
                title: "大模型是怎么“思考”的",
                description: "从 Token、注意力、自回归生成和采样机制出发，解释大模型在代码场景中为什么会惊艳，也为什么会犯错。",
                href: "/zh/articles/ai-understanding-code-illusion",
                meta: "AI 编程 · LLM"
              },
          {
                title: "浪潮之中：从 Verb Coding 到 AI 协作——一名技术人的反思与重构",
                description: "回望 AI 编程这两年，从粘贴代码、Copilot 到 Agent 协作，聊聊这场技术浪潮带来的反思与思考。",
                href: "/zh/articles/ai-collaboration",
                meta: "AI 编程 · AI 协作"
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
                meta: "行业感悟 · Career"
              },
          {
                title: "当无聊消失之后",
                description: "从短视频、算法推荐与注意力经济出发，反思信息过载时代对个人注意力与独立判断力的深度塑造。",
                href: "/zh/articles/ai-attention",
                meta: "行业感悟 · Attention"
              },
          {
                title: "如何做好一个技术 Leader",
                description: "围绕第三驱动力、以身作则、建立私交和团队氛围，整理一线技术管理中的经验与取舍。",
                href: "/zh/articles/leader",
                meta: "行业感悟 · Leadership"
              },
          {
                title: "互联网围城：学习诅咒与 35 岁断崖的战争",
                description: "站在技术从业者的角度，聊聊互联网的行业特点、学习诅咒、加班成风、以及 35 岁职业危机与跳槽选择。",
                href: "/zh/articles/internet-siege",
                meta: "行业感悟 · Career"
              },
          {
                title: "互联网围城（下）：从技术奴隶到命运抗争",
                description: "在日常积累中掌握可进可退的主动权，理智地面对工作与同事关系，并在莫测的职业发展道路上保持抗争。",
                href: "/zh/articles/slave-to-fate",
                meta: "行业感悟 · Career"
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
      description: "Chinese essays on abstraction, performance, memory, IO, and the constraints that shape software systems.",
      items: [
          {
                title: "Understanding Memory Management",
                description: "A Chinese essay tracing memory management from physical and virtual memory to user-space allocators and runtime GC designs across C/C++, Rust, Java, and Go.",
                href: "/en/articles/understanding-memory",
                meta: "Systems · Memory"
              },
          {
                title: "Why We Need QUIC",
                description: "A Chinese essay explaining the evolution from HTTP/1.x and HTTP/2 to QUIC, analyzing why we need user-space protocols to solve head-of-line blocking, achieve zero-RTT handshake, and support connection migration.",
                href: "/en/articles/why-we-need-quic",
                meta: "Systems · Networking"
              },
          {
                title: "Object-Oriented Programming",
                description: "A Chinese essay revisiting OOP through the software crisis, abstraction, SOLID principles, and design patterns.",
                href: "/en/articles/object-oriented-programming",
                meta: "Systems · OOP"
              },
          {
                title: "Network IO Multiplexing",
                description: "A Chinese essay on sockets, non-blocking IO, select/poll, epoll, threading models, and buffer organization.",
                href: "/en/articles/network-io-multiplexing",
                meta: "Systems · Networking"
              },
          {
                title: "Software Performance: CPU",
                description: "A Chinese essay on CPU hardware traits like multi-core execution, cache lines, and branch prediction, and how to optimize computational execution.",
                href: "/en/articles/software-performance-cpu",
                meta: "Systems · CPU"
              },
          {
                title: "Software Performance: IO",
                description: "A Chinese essay on IO bottlenecks across disk, network, memory, and locks, and how system design trades long resources for short ones.",
                href: "/en/articles/software-performance-io",
                meta: "Systems · Performance"
              },
          {
                title: "Architecture Practice: Data Conversion Service",
                description: "A Chinese essay on designing and building a high-throughput, zero-hardcoding extensible data service based on hexagonal architecture, chain of responsibility, and composite patterns.",
                href: "/en/articles/architecture-practice-data-conversion-service",
                meta: "Systems · Design"
              },
          {
                title: "Avoiding Software Decay",
                description: "A Chinese essay reflecting on why code inevitably slides into decay, and engineering strategies to mitigate technical debt.",
                href: "/en/articles/avoid-software-decay",
                meta: "Systems · Architecture"
              },
          {
                title: "When Query Meets Distributed",
                description: "A Chinese essay examining list querying challenges in microservices, detailing the trade-offs between API composition, CQRS, and shared database patterns.",
                href: "/en/articles/distributed-query",
                meta: "Systems · Design"
              }
      ]
    },
    {
      name: "AI Coding",
      description: "Chinese essays on large models, context, tool use, and the engineering loops behind AI coding systems.",
      items: [
          {
                title: "You Think You're Chatting with AI, but You're Managing a Finite Textbox",
                description: "A Chinese essay analyzing LLM context windows, system prompts, and multi-turn conversations to understand how to manage information within a finite attention budget.",
                href: "/en/articles/ai-chat-is-context-management",
                meta: "AI Coding · Context"
              },
          {
                title: "Technical Beginners in the AI Era",
                description: "A Chinese essay reflecting on how AI affects the growth path of junior developers, and how to cultivate core judgment and systems thinking.",
                href: "/en/articles/ai-area-studying",
                meta: "AI Coding · Career"
              },
          {
                title: "Should We Still Learn CS Foundations in the Age of AI Coding?",
                description: "A Chinese essay examining why foundational CS topics like data structures remain critical for developer judgment in the AI era.",
                href: "/en/articles/ai-basic-learning",
                meta: "AI Coding · Foundations"
              },
          {
                title: "How Large Models “Think”",
                description: "A Chinese essay on tokens, attention, autoregressive generation, sampling, and why LLMs can be both impressive and unreliable in coding work.",
                href: "/en/articles/ai-understanding-code-illusion",
                meta: "AI Coding · LLM"
              },
          {
                title: "Inside the Wave: From Verb Coding to AI Collaboration",
                description: "A Chinese essay reflecting on the evolution of AI coding from chatbots and Copilots to autonomous agents, and what it means for developers.",
                href: "/en/articles/ai-collaboration",
                meta: "AI Coding · AI"
              }
      ]
    },
    {
      name: "Industry Reflections",
      description: "Chinese essays on engineering leadership, team work, and long-term technical judgment.",
      items: [
          {
                title: "The Developer's Diary (Fragments)",
                description: "A Chinese essay styled as a sci-fi developer diary from 2023 to 2029, tracking a programmer's journey through AI collaboration and agent-driven workflows.",
                href: "/en/articles/coding-diary",
                meta: "Reflection · Career"
              },
          {
                title: "When Boredom Disappears",
                description: "A Chinese essay exploring recommendation algorithms, the attention economy, and how constant stimulation shapes our judgment and focus.",
                href: "/en/articles/ai-attention",
                meta: "Reflection · Attention"
              }
      ]
    },
    {
      name: "Other",
      description: "A placeholder category for writing that does not yet belong to a fixed topic.",
      items: [
          
      ]
    }
  ]
} satisfies Record<Locale, WritingGroup[]>;

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
  ]
} satisfies Record<Locale, HighlightItem[]>;

function processSiteContent(content: Record<Locale, SiteContent>): Record<Locale, SiteContent> {
  const keys: Locale[] = ["zh", "en"];
  for (const lang of keys) {
    const item = content[lang];
    if (item.homePath) item.homePath = getRelativePath(item.homePath);
    if (item.oppositeLocale && item.oppositeLocale.href) {
      item.oppositeLocale.href = getRelativePath(item.oppositeLocale.href);
    }
    if (item.nav) {
      for (const navItem of item.nav) {
        navItem.href = getRelativePath(navItem.href);
      }
    }
    if (item.hero) {
      if (item.hero.primaryCta) {
        item.hero.primaryCta.href = getRelativePath(item.hero.primaryCta.href);
      }
      if (item.hero.secondaryCta) {
        item.hero.secondaryCta.href = getRelativePath(item.hero.secondaryCta.href);
      }
    }
    if (item.books) {
      for (const book of item.books) {
        book.href = getRelativePath(book.href);
        if (book.cover && book.cover.src) {
          book.cover.src = getRelativePath(book.cover.src);
        }
      }
    }
    if (item.projects) {
      for (const proj of item.projects) {
        proj.href = getRelativePath(proj.href);
        if (proj.logo && proj.logo.src) {
          proj.logo.src = getRelativePath(proj.logo.src);
        }
      }
    }
    if (item.writings) {
      for (const writing of item.writings) {
        writing.href = getRelativePath(writing.href);
      }
    }
    if (item.writingGroups) {
      for (const group of item.writingGroups) {
        if (group.items) {
          for (const writing of group.items) {
            writing.href = getRelativePath(writing.href);
          }
        }
      }
    }
    if (item.connect) {
      for (const conn of item.connect) {
        conn.href = getRelativePath(conn.href);
      }
    }
  }
  return content;
}

const rawSiteContent: Record<Locale, SiteContent> = {
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

export const siteContent = processSiteContent(rawSiteContent);