function app() {
    return {
        darkMode: false,
        lang: 'pt',
        mobileMenuOpen: false,
        activeModal: null,
        activeSection: 'home',
        scrollY: 0,
        newsletterEmail: '',
        newsletterName: '',
        newsletterSent: false,

        // ── Dynamic content (populated by Firebase via admin.js) ─────────────
        dynamicNewsItems: [],
        dynamicResearchItems: [],
        heroStats: [
            { value: '4', label_pt: 'Áreas de Atuação', label_en: 'Areas of Expertise' },
            { value: '60h+', label_pt: 'Horas de Diálogos', label_en: 'Hours of Dialogues' },
            { value: 'GRI', label_pt: 'Padrão Internacional', label_en: 'International Standard' },
            { value: 'ESG', label_pt: '100% Transparência', label_en: 'Full Transparency' },
        ],

        init() {
            const sd = localStorage.getItem('esg-dark');
            if (sd !== null) this.darkMode = sd === 'true';
            else if (window.matchMedia('(prefers-color-scheme: dark)').matches) this.darkMode = true;
            const sl = localStorage.getItem('esg-lang');
            if (sl) this.lang = sl;
            window.addEventListener('scroll', () => { this.scrollY = window.scrollY; this.updateActiveSection(); });

            // Expose Alpine.js data globally so admin.js can update it reactively
            window.__esgData = this;
        },

        toggleDark() { this.darkMode = !this.darkMode; localStorage.setItem('esg-dark', this.darkMode); },
        toggleLang() { this.lang = this.lang === 'pt' ? 'en' : 'pt'; localStorage.setItem('esg-lang', this.lang); },

        t(key) {
            const keys = key.split('.');
            let val = this.ui[this.lang];
            for (const k of keys) val = val?.[k];
            return val || key;
        },

        openModal(key) { this.activeModal = key; document.body.style.overflow = 'hidden'; },
        closeModal() { this.activeModal = null; document.body.style.overflow = ''; },

        updateActiveSection() {
            for (const id of ['contact', 'research', 'areas', 'about', 'news', 'home']) {
                const el = document.getElementById(id);
                if (el && window.scrollY >= el.offsetTop - 130) { this.activeSection = id; break; }
            }
        },

        scrollTo(id) {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            this.mobileMenuOpen = false;
        },

        submitNewsletter() {
            if (this.newsletterEmail.trim()) this.newsletterSent = true;
        },

        get areas() {
            return Object.entries(this.areasData[this.lang]).map(([key, d]) => ({ key, ...d }));
        },

        get activeArea() {
            if (!this.activeModal) return null;
            return this.areasData[this.lang]?.[this.activeModal] || null;
        },

        // ── Helper: get hero stat label per language ──────────────────────────
        heroStatLabel(stat) {
            return this.lang === 'en' ? (stat.label_en || stat.label_pt) : stat.label_pt;
        },

        areasData: {
            pt: {
                env: {
                    name: 'Meio Ambiente', color: '#10B981', colorSoft: 'rgba(16,185,129,0.12)', icon: 'fa-leaf',
                    img: 'https://esgetal.com.br/_assets/media/cb097873ec0a286a796a5b4f20fdca6e.png',
                    desc: 'Promovemos a interação responsável com os recursos naturais e a biodiversidade, oferecendo soluções para neutralização das emissões de GEE, restauração e preservação ambiental. Nossos serviços incluem gestão de resíduos, avaliação, monitoramento e mitigação de riscos e impactos ambientais e a implantação de estratégias de adaptação e resiliência climáticas.',
                    subtopics: [
                        { title: 'Gestão sustentável de recursos e resíduos', img: 'https://esgetal.com.br/meioambiente/media/24e2b502b383f5959a73a7bff6990dc1.jpg', items: ['Implantamos soluções de economia circular e gestão integrada de resíduos, promovendo o uso eficiente dos recursos.', 'Desenvolvemos iniciativas para aprimorar os processos produtivos e minimizar os impactos ambientais.'] },
                        { title: 'Análise e monitoramento de riscos e impactos ambientais', img: 'https://esgetal.com.br/meioambiente/media/b2080bb4f83fafef739d6295c5782285.jpg', items: ['Realizamos diagnósticos detalhados de riscos ambientais, identificando vulnerabilidades e propondo ações para controle e mitigação.', 'Monitoramos impactos ambientais ao longo do tempo, oferecendo soluções para adaptação e resiliência às mudanças climáticas.'] },
                        { title: 'Projetos de restauração e preservação ambiental', img: 'https://esgetal.com.br/meioambiente/media/9f1a87d71ccb601917000dcc429dfcc3.jpg', items: ['Desenvolvemos e implantamos iniciativas de recuperação ambiental em áreas críticas, como nascentes e florestas degradadas.', 'Elaboramos projetos visando à preservação de recursos naturais e biodiversidade, seguindo padrões internacionais de sustentabilidade.'] }
                    ],
                    testimonial: '"A visão integrada da ESG e Tal em relação às questões sociais e ambientais tem sido fundamental para o desenvolvimento de projetos complexos de recuperação ambiental e sustentabilidade social e hídrica. O fato de trabalharem com padrões internacionais de sustentabilidade garante um rigor técnico muito importante".',
                    testimonialAuthor: 'Eng. Agrônomo Prof. Rinaldo Calheiros, Mestre e Doutor pela USP em Irrigação e Drenagem, Pesquisador e Consultor no planejamento, monitoramento e gestão de recursos hídricos'
                },
                social: {
                    name: 'Responsabilidade Social', color: '#F59E0B', colorSoft: 'rgba(245,158,11,0.12)', icon: 'fa-people-group',
                    img: 'https://esgetal.com.br/_assets/media/3d3ae45afb2c43920a5dd6a3c8c3b643.png',
                    desc: 'Trabalhamos diretamente com comunidades, promovendo inclusão produtiva, capacitação e desenvolvimento sustentável. Nossas ações focam em mulheres, populações tradicionais e grupos vulneráveis, impulsionando práticas responsáveis de consumo e produção, com impactos reais na geração de renda e na melhoria das condições de vida.',
                    subtopics: [
                        { title: 'Arranjos Produtivos Locais (APLs) e Inclusão Socioprodutiva', img: 'https://esgetal.com.br/responsabilidade/media/a780f332c27c6f10e5e540737ee3993e.jpg', items: ['Desenvolvemos e apoiamos a implantação de APLs, integrando atividades econômicas de forma sustentável, como agricultura e pesca.', 'Trabalhamos em parceria com governos locais e ONGs para promover qualificação profissional e a integração das comunidades.'] },
                        { title: 'Promoção da inclusão e diversidade', img: 'https://esgetal.com.br/responsabilidade/media/1d47172bdb6a854200578baec22f8fd3.jpg', items: ['Desenvolvemos programas de inclusão com foco em diversidade de gênero, etnia, faixa etária, orientação sexual e ancestralidade.', 'Apoiamos a implantação de iniciativas que ampliem o acesso equânime às oportunidades e reduzam as desigualdades nas organizações.'] },
                        { title: 'Investimentos sociais estratégicos', img: 'https://esgetal.com.br/responsabilidade/media/83842c67521034cfb010d2c521d52c89.jpg', items: ['Apoiamos a estruturação de projetos sociais e produtivos que promovam o desenvolvimento econômico e inclusivo de comunidades.', 'Desenvolvemos estratégias para alavancar investimentos sociais, conectando ações de impacto aos objetivos das organizações.'] }
                    ],
                    testimonial: '"É sempre uma alegria encontrar Marcus e a Consultoria ESG e Tal para discutir questões sobre o tema Sustentabilidade. Sempre com colocações e análises pertinentes, tecnicamente embasadas e com um olhar amplo sobre todas as esferas".',
                    testimonialAuthor: 'Christiana Costa, Superintendente de Sustentabilidade da Arteris, ex-Gerente de Sustentabilidade Corporativa da CPFL Renováveis e ex-Gerente Geral de Relações com Comunidades da Vale'
                },
                gov: {
                    name: 'Governança', color: '#3B82F6', colorSoft: 'rgba(59,130,246,0.12)', icon: 'fa-scale-balanced',
                    img: 'https://esgetal.com.br/_assets/media/6a6c33eee9e3a654b3119362320850e6.jpg',
                    desc: 'Aprimoramos a governança corporativa de organizações por meio da implantação de padrões éticos e auditorias rigorosas, conforme diretrizes nacionais e globais (ABNT PR 2030, GRI, IFRS, entre outras). Oferecemos consultoria para fortalecimento de conselhos e implantação de mecanismos de compliance e grievance (queixas), garantindo transparência e conformidade.',
                    subtopics: [
                        { title: 'Compliance, "queixas" e auditoria em ESG', img: 'https://esgetal.com.br/governanca/media/66329b804d8f8a57cb016fecb429342d.jpg', items: ['Implantamos mecanismos de compliance e queixas ("grievance") em conformidade com padrões globais de direitos humanos e gênero.', 'Realizamos auditorias periódicas para avaliar e monitorar a conformidade, identificando áreas de melhoria em governança e transparência.'] },
                        { title: 'Capacitação e fortalecimento de lideranças e instituições', img: 'https://esgetal.com.br/governanca/media/c9a1f2f3996f561fad0069fb38de525a.png', items: ['Apoiamos a criação e fortalecimento de estruturas de transparência e governança, como comitês, conselhos e grupos de trabalho.', 'Desenvolvemos treinamentos customizados para lideranças formais e informais, com foco no engajamento com stakeholders e em ESG.'] },
                        { title: 'Avaliação e monitoramento de riscos e aspectos ESG', img: 'https://esgetal.com.br/governanca/media/648cbfb633abf4c1a1811ae3117bc20a.jpg', items: ['Oferecemos soluções de monitoramento contínuo de riscos ESG, atendendo a padrões globais de sustentabilidade.', 'Realizamos avaliações estruturadas, incluindo recomendações, ações de mitigação de impactos e de melhoria do desempenho.'] }
                    ],
                    testimonial: '"O Grupo é liderado por um profissional excepcional, com sólida formação acadêmica e características únicas, como comprometimento, foco e criatividade. Sob sua liderança, projetos importantes foram conduzidos, oferecendo apoio às operações e à sede de uma grande empresa, abordando questões complexas como geopolítica e engajamento de stakeholders. Suas contribuições foram fundamentais para o desenvolvimento da organização".',
                    testimonialAuthor: 'Fabio Rua, Vice-Presidente de Relações Governamentais, Comunicação e ESG da General Motors para a América do Sul e ex-Diretor de Relações Governamentais e Assuntos Regulatórios da IBM América Latina'
                },
                comm: {
                    name: 'Comunicação Estratégica', color: '#8B5CF6', colorSoft: 'rgba(139,92,246,0.12)', icon: 'fa-bullhorn',
                    img: 'https://esgetal.com.br/_assets/media/f2f3a9eb3664b94a7e584054adaee240.jpg',
                    desc: 'Desenvolvemos estratégias de comunicação que aumentam a reputação corporativa e o engajamento dos stakeholders. Nossas soluções em branding, comunicação visual e presença digital são projetadas para consolidar marcas e criar uma comunicação transparente e eficaz, alinhada com os objetivos de sustentabilidade da organização.',
                    subtopics: [
                        { title: 'Gestão de marca e reputação', img: 'https://esgetal.com.br/comunicacao/media/a04fbb12fc2677ec8810c2b0ff01141b.jpg', items: ['Desenvolvemos estratégias completas de branding para fortalecer a reputação corporativa e melhorar o relacionamento com stakeholders.', 'Implantamos programas de avaliação contínua da reputação, medindo o impacto das iniciativas ESG nas percepções dos públicos e na marca.'] },
                        { title: 'Comunicação visual de alto impacto', img: null, items: ['Produzimos materiais visuais (infográficos, relatórios etc.) que comunicam claramente os compromissos de sustentabilidade.', 'Desenvolvemos peças de comunicação impressa e digital que reforçam o valor da marca e compromissos em ESG, como os ODS.'] },
                        { title: 'Estratégias de gestão e relacionamento com stakeholders', img: 'https://esgetal.com.br/comunicacao/media/97993f4bc30239967c2914bf09e56ec8.jpg', items: ['Desenvolvemos estratégias para melhorar as relações das empresas com seus públicos-alvo, ampliando seu engajamento via CRM / SRM.', 'Realizamos a avaliação de desempenho de visibilidade e implantamos melhorias que ampliam o alcance das iniciativas.'] }
                    ],
                    testimonial: '"A ESG e Tal é liderada por um profissional competente, versátil e proativo, focado no trabalho, que possui ótimo relacionamento com clientes internos e externos, veículos de comunicação e demais stakeholders. Muito dinâmico, trabalha bem em equipe, identifica oportunidades de melhoria do serviço e propõe soluções concretas".',
                    testimonialAuthor: 'Renato Saraiva, Gerente Corporativo da Qualidade e SSMA do Grupo Darcy Pacheco e ex-Gerente de SSMA da Gerdau'
                }
            },
            en: {
                consulting: {
                    name: 'Consulting', color: '#1E3A5F', colorSoft: 'rgba(30,58,95,0.12)', icon: 'fa-briefcase',
                    img: 'https://esgetal.com.br/engl/images/9ea0208feda82e0a9dbaa5629d9caeba.png',
                    desc: 'We provide strategic guidance and consultancy to public and private organizations in the development and implementation of ESG best practices, enabling the sustainable growth of their businesses in harmony with the development of the territories in which they operate.',
                    subtopics: [
                        { title: 'ESG Strategy & Implementation', img: 'https://esgetal.com.br/governanca/media/66329b804d8f8a57cb016fecb429342d.jpg', items: ['We design and implement tailored ESG strategies aligned with international standards (GRI, IFRS S1/S2, ABNT PR 2030).', 'We conduct ESG diagnostics and maturity assessments to identify gaps and opportunities.'] },
                        { title: 'Governance & Compliance', img: 'https://esgetal.com.br/governanca/media/c9a1f2f3996f561fad0069fb38de525a.png', items: ['We implement compliance and grievance mechanisms following global human rights and gender standards.', 'We support board strengthening, committee creation, and stakeholder engagement frameworks.'] },
                        { title: 'Environmental & Social Risk Management', img: 'https://esgetal.com.br/meioambiente/media/b2080bb4f83fafef739d6295c5782285.jpg', items: ['We provide continuous ESG risk monitoring solutions meeting global sustainability standards.', 'We conduct structured assessments with impact mitigation recommendations and performance improvement actions.'] }
                    ],
                    testimonial: '"The Group is led by an exceptional professional, with strong academic background and unique characteristics such as commitment, focus, and creativity. Under his leadership, important projects were conducted addressing complex issues such as geopolitics and stakeholder engagement."',
                    testimonialAuthor: 'Fabio Rua, VP of Government Relations, Communication and ESG at GM for South America'
                },
                education: {
                    name: 'Education & Content', color: '#10B981', colorSoft: 'rgba(16,185,129,0.12)', icon: 'fa-graduation-cap',
                    img: 'https://esgetal.com.br/engl/images/262d949b36ac8d8d85620ed800ff8187.png',
                    desc: 'We produce customized training and content, following rigorous standards of excellence and adhering to the main national and global guidelines, such as ABNT PR 2030, UN SDGs, World Bank Performance Standards, GRI, among others.',
                    subtopics: [
                        { title: 'Customized ESG Training', img: 'https://esgetal.com.br/governanca/media/648cbfb633abf4c1a1811ae3117bc20a.jpg', items: ['We develop customized training programs for formal and informal leaders, focusing on stakeholder engagement and ESG.', 'We offer in-person and online capacity-building workshops tailored to each organization\'s context.'] },
                        { title: 'Sustainability Content Production', img: 'https://esgetal.com.br/comunicacao/media/a04fbb12fc2677ec8810c2b0ff01141b.jpg', items: ['We produce reports, infographics, and multimedia content that communicate ESG commitments clearly.', 'We develop educational materials aligned with UN SDGs, GRI, and international sustainability guidelines.'] },
                        { title: 'Research & Publications', img: 'https://esgetal.com.br/_assets/media/9fc7ceb1990dd3185b72598a54da4d5a.jpg', items: ['We conduct applied research on ESG topics, producing evidence-based knowledge for organizations.', 'We publish articles, studies and toolkits to support decision-making and disseminate best practices.'] }
                    ],
                    testimonial: '"It is always a joy to meet Marcus and ESG e Tal Consultancy to discuss sustainability topics. Always with pertinent and technically grounded analyses, with a broad view of all dimensions."',
                    testimonialAuthor: 'Christiana Costa, Sustainability Superintendent at Arteris, former Corporate Sustainability Manager at CPFL Renováveis'
                },
                retail: {
                    name: 'Retail', color: '#F59E0B', colorSoft: 'rgba(245,158,11,0.12)', icon: 'fa-store',
                    img: 'https://esgetal.com.br/engl/images/e259250c085340aad1e6d11346abdc1a.png',
                    desc: 'We offer sustainable solutions for retail, promoting a complete circular process: from reuse to fair margins and income local generation. Highlight your organization as a positive player for change, managing profit and social responsibility.',
                    subtopics: [
                        { title: 'Circular Economy Solutions', img: 'https://esgetal.com.br/meioambiente/media/24e2b502b383f5959a73a7bff6990dc1.jpg', items: ['We implement circular economy models for retail, promoting product reuse and responsible waste management.', 'We design processes that maximize resource efficiency and reduce environmental footprint across the supply chain.'] },
                        { title: 'Sustainable Supply Chain', img: 'https://esgetal.com.br/responsabilidade/media/a780f332c27c6f10e5e540737ee3993e.jpg', items: ['We map and improve supply chains to ensure fair margins and positive local income generation.', 'We support the integration of local producers and communities into sustainable retail ecosystems.'] },
                        { title: 'Impact Communication for Retail', img: 'https://esgetal.com.br/comunicacao/media/97993f4bc30239967c2914bf09e56ec8.jpg', items: ['We develop communication strategies that position your brand as a genuine driver of positive change.', 'We create transparent ESG narratives for consumers, investors and partners in the retail sector.'] }
                    ],
                    testimonial: '"The integrated vision of ESG e Tal regarding social and environmental issues has been fundamental to the development of complex environmental recovery projects. Working with international sustainability standards guarantees very important technical rigor."',
                    testimonialAuthor: 'Prof. Rinaldo Calheiros, MSc and PhD from the University of São Paulo (USP) in Irrigation and Drainage'
                }
            }
        },

        ui: {
            pt: {
                nav: { home: 'Inicial', news: 'Notícias', about: 'Quem Somos', areas: 'Áreas de Atuação', research: 'Pesquisa e Estudos', contact: 'Contatos' },
                hero: { tag1: 'Sustentabilidade', tag2: 'Legitimidade', tag3: 'Transparência', subtitle: 'Transformando práticas ESG em resultados reais para empresas, comunidades e territórios.', cta: 'Fale Conosco', ctaSub: 'Saiba Mais' },
                news: {
                    title: 'Notícias e Atualizações',
                    item1: { date: '01/01/2026', headline: '"ESG e Tal – 60 Horas de Diálogos sobre Sustentabilidade para um Mundo Melhor"', link: 'Clique aqui para adquirir a obra com desconto', linkAlt: 'também disponível na Amazon', body: 'Ela nasceu da convicção de que as práticas socioambientais, de governança e reputação não se limitam a grandes centros corporativos: elas pulsam nas escolas, pequenos negócios e na resiliência do povo, do Agreste Alagoano às grandes conferências internacionais.', body2: 'A iniciativa da ESG e Tal tem autoria de Marcus Vinicius Peixoto da Silva e projeto gráfico, ilustrações e capa de José Adnael Silva, tendo sido viabilizada com recursos da Política Nacional Aldir Blanc, do Governo Federal, através do Ministério da Cultura. A PNAB/AL foi operacionalizada pelo Governo de Alagoas por meio da Secretaria de Estado da Cultura e Economia Criativa de Alagoas.' },
                    item2: { date: '28/05/2025', headline: 'Diretor da ESG e Tal recebe prêmio: cordel reúne inclusão, inovação, cultura e legado', link: 'Clique aqui e acesse a versão eletrônica.', body: 'Se preferir baixar a obra para impressão (PDF),', linkPDF: 'clique neste link' },
                    nl: { title: 'Fique por dentro', subtitle: 'Receba pesquisas, notícias e insights sobre ESG diretamente na sua caixa de entrada.', namePh: 'Seu nome completo', emailPh: 'Seu melhor e-mail', btn: 'Inscrever-se gratuitamente', ok: 'Inscrição realizada! Em breve você receberá nossas novidades.', disclaimer: 'Respeitamos sua privacidade · Cancele a qualquer momento · Cumprimos a LGPD' }
                },
                about: { title: 'NOSSO PROPÓSITO', subtitle: 'Transformar sustentabilidade em resultados, com transparência e inclusão produtiva.', quote: '"Queremos que nossos clientes sejam referência no Brasil em boas práticas ESG e Comunicação, promovendo o desenvolvimento socioeconômico de maneira inclusiva. Para isso, construímos parcerias de longo prazo com organizações que buscam impactar de modo positivo o meio ambiente, a sociedade e a governança nos territórios nos quais estejam inseridas".', quoteAuthor: 'Marcus Vinicius Peixoto da Silva', quoteRole: 'Sócio-Diretor da ESG e Tal', testimonial: '"O Grupo é liderado por um profissional excepcional, com sólida formação acadêmica e características únicas, como comprometimento, foco e criatividade. Sob sua liderança, projetos importantes foram conduzidos, oferecendo apoio às operações e à sede de uma grande empresa, abordando questões complexas como geopolítica e engajamento de stakeholders. Suas contribuições foram fundamentais para o desenvolvimento da organização".', testimonialAuthor: 'Fabio Rua', testimonialRole: 'Vice-Presidente de Relações Governamentais, Comunicação e ESG da GM para a América do Sul e ex-Diretor de Relações Governamentais e Assuntos Regulatórios da IBM para a América Latina' },
                areas: { title: 'Áreas de Atuação', learnMore: 'Saiba Mais' },
                research: { title: 'Pesquisa e Estudos', item1: { date: '14/01/2026', headline: 'Precisamos falar de segurança pública: quando uma vida, o "S" de ESG e o território se encontram', author: 'Artigo de Marcus Peixoto (ESG e Tal), sobre segurança pública, planejamento territorial e design ambiental.', cta: 'Clique aqui e acesse o artigo completo', body1: 'O artigo compila dados e análises técnicas sobre segurança urbana e soluções de design ambiental. Desejamos que ele alcance o maior número de mãos comprometidas com uma mudança real no cenário da violência de gênero, como lideranças, gestores e pesquisadores.', body2: 'O acesso é gratuito. Pedimos apenas um breve cadastro para manter um canal aberto sobre futuras ações e debates focados na melhoria dos indicadores socioeconômicos em nossos territórios.', body3: 'A ESG e Tal cumpre rigorosamente a legislação de proteção de dados (LGPD). Nossos representantes e parceiros respeitam ao máximo as razões que motivaram a elaboração deste documento.' } },
                contact: { title: 'Fale Conosco', subtitle: 'Estamos prontos para ajudar sua empresa a alcançar resultados sustentáveis e impactar positivamente o mundo.', body: 'Entre em contato com a ESG e Tal e descubra como podemos trabalhar juntos para criar soluções inovadoras em ESG e comunicação estratégica.', cta1: 'Solicite uma proposta customizada', cta2: 'Converse com nosso(a)s especialistas' },
                footer: { tagline: 'Sustentabilidade · Legitimidade · Transparência', rights: '© 2026 ESG e Tal Consultancy. Todos os direitos reservados.' },
                modal: { close: 'Fechar', testimonialLabel: 'O que dizem sobre nós' }
            },
            en: {
                nav: { home: 'Home', news: 'News', about: 'About Us', areas: 'Expertise', research: 'Research', contact: 'Contact' },
                hero: { tag1: 'Sustainability', tag2: 'Legitimacy', tag3: 'Transparency', subtitle: 'Turning ESG practices into real results for companies, communities, and territories.', cta: 'Contact Us', ctaSub: 'Learn More' },
                news: {
                    title: 'News & Updates',
                    item1: { date: '01/01/2026', headline: '"ESG e Tal – 60 Hours of Dialogues on Sustainability for a Better World"', link: 'Click here to purchase the book at a discount', linkAlt: 'also available on Amazon', body: 'Born from the conviction that socio-environmental, governance, and reputational practices are not limited to large corporate centers: they pulse in schools, small businesses, and the resilience of people, from the Agreste Alagoano to major international conferences.', body2: 'The ESG e Tal initiative was authored by Marcus Vinicius Peixoto da Silva with graphic design, illustrations and cover by José Adnael Silva, made possible by the Aldir Blanc National Policy, through the Ministry of Culture.' },
                    item2: { date: '28/05/2025', headline: 'ESG e Tal Director Receives Award: cordel brings together inclusion, innovation, culture and legacy', link: 'Click here to access the electronic version.', body: 'If you prefer to download for printing (PDF),', linkPDF: 'click here' },
                    nl: { title: 'Stay in the loop', subtitle: 'Receive our latest research, news, and ESG insights directly in your inbox.', namePh: 'Your full name', emailPh: 'Your best email', btn: 'Subscribe for free', ok: 'You\'re subscribed! You\'ll hear from us soon.', disclaimer: 'We respect your privacy · Unsubscribe anytime · LGPD compliant' }
                },
                about: { title: 'OUR PURPOSE', subtitle: 'Transform sustainability into results, with transparency and productive inclusion.', quote: '"We want our clients to be a reference in Brazil for good ESG and Communication practices, promoting socioeconomic development inclusively. To this end, we build long-term partnerships with organizations that seek to positively impact the environment, society, and governance in the territories where they operate".', quoteAuthor: 'Marcus Vinicius Peixoto da Silva', quoteRole: 'Managing Director, ESG e Tal', testimonial: '"The Group is led by an exceptional professional, with strong academic background and unique characteristics such as commitment, focus, and creativity. Under his leadership, important projects were conducted, providing support to operations and the headquarters of a large company, addressing complex issues such as geopolitics and stakeholder engagement. His contributions were fundamental to the organization\'s development".', testimonialAuthor: 'Fabio Rua', testimonialRole: 'VP of Government Relations, Communication and ESG at GM for South America and former Director of Government Relations and Regulatory Affairs at IBM for Latin America' },
                areas: { title: 'Areas of Expertise', learnMore: 'Learn More' },
                research: { title: 'Research & Studies', item1: { date: '01/14/2026', headline: 'We need to talk about public security: when a life, the "S" in ESG, and territory intersect', author: 'Article by Marcus Peixoto (ESG e Tal), on public security, territorial planning, and environmental design.', cta: 'Click here to access the full article', body1: 'The article compiles technical data and analyses on urban security and environmental design solutions. We hope it reaches the greatest number of hands committed to real change in the landscape of gender violence.', body2: 'Access is free. We only ask for a brief registration to maintain an open channel on future actions and debates focused on improving socioeconomic indicators in our territories.', body3: 'ESG e Tal strictly complies with data protection legislation (LGPD). Our representatives and partners fully respect the reasons that motivated the preparation of this document.' } },
                contact: { title: 'Get in Touch', subtitle: 'We are ready to help your company achieve sustainable results and make a positive impact on the world.', body: 'Contact ESG e Tal and discover how we can work together to create innovative solutions in ESG and strategic communication.', cta1: 'Request a customized proposal', cta2: 'Talk to one of our specialists' },
                footer: { tagline: 'Sustainability · Legitimacy · Transparency', rights: '© 2026 ESG e Tal Consultancy. All rights reserved.' },
                modal: { close: 'Close', testimonialLabel: 'What they say about us' }
            }
        }
    };
}