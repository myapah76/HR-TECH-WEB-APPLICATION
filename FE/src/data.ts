/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HandbookArticle, Job, Recruiter } from '@/src/types';

export const INITIAL_JOBS: Job[] = [
  // --- FEATURED JOBS (Việc Làm Nổi Bật) ---
  {
    id: 'feat-1',
    title: 'Kỹ sư giám sát xây dựng',
    titleEn: 'Construction Supervision Engineer',
    company: 'CÔNG TY CỔ PHẦN FECON SOUTH',
    logo: 'CS',
    logoBg: 'bg-emerald-600',
    salary: '15 Tr - 25 Tr VND',
    location: 'Hồ Chí Minh',
    tags: ['MỚI'],
    type: 'featured',
    description: 'Chịu trách nhiệm giám sát thi công cơ điện, kết cấu thép, nền móng tại các dự án trọng điểm khu vực phía Nam. Đảm bảo tiến độ, chất lượng đạt tiêu chuẩn quốc tế và an toàn lao động tối đa tại công trường.',
    descriptionEn: 'Responsible for supervising electrical, steel structure, and foundation construction at key projects in Southern Vietnam. Ensure schedule compliance, quality meets international standards, and maximum workplace safety on site.',
    requirements: [
      'Tốt nghiệp Đại học chuyên ngành Xây dựng Dân dụng & Công nghiệp hoặc liên quan.',
      'Tối thiểu 3 năm kinh nghiệm giám sát hiện trường, ưu tiên dự án hạ tầng lớn.',
      'Khả năng đọc hiểu bản vẽ kỹ thuật, sử dụng thành thạo AutoCAD và phần mềm chuyên môn.',
      'Có chứng chỉ hành nghề giám sát hạng II trở lên.'
    ],
    requirementsEn: [
      'Bachelor\'s degree in Civil & Industrial Construction or related field.',
      'Minimum 3 years on-site supervision experience, preferably on large infrastructure projects.',
      'Ability to read technical drawings, proficiency with AutoCAD and specialized software.',
      'Grade II Supervisory license or higher.'
    ],
    benefits: [
      'Mức lương cạnh tranh dao động từ 15,000,000đ - 25,000,000đ tùy thuộc vào năng lực.',
      'Lương tháng 13 và thưởng dự án cực kỳ hấp dẫn dựa trên chất lượng thi công.',
      'Gói bảo hiểm sức khỏe cá nhân cao cấp, khám sức khỏe tổng quát hằng năm.',
      'Hỗ trợ toàn bộ chi phí sinh hoạt, ăn ở trực tiếp tại công trường.'
    ],
    benefitsEn: [
      'Competitive salary ranging from $650-$1,080 depending on qualifications.',
      'Month 13 salary and attractive project bonuses based on construction quality.',
      'Premium health insurance package with annual comprehensive check-ups.',
      'Support for all living expenses and on-site accommodation.'
    ],
    postedAt: '1 ngày trước',
    skills: ['Xây dựng', 'AutoCAD', 'Giám sát dự án']
  },
  {
    id: 'feat-2',
    title: 'Nhân viên kế toán kiểm soát ngành ống nhựa',
    titleEn: 'Accounting Control Staff - Plastic Pipe Industry',
    company: 'Tập Đoàn Tân Á Đại Thành',
    logo: 'TA',
    logoBg: 'bg-blue-600',
    salary: '10 Tr - 12 Tr VND',
    location: 'Hà Nội',
    locationEn: 'Hanoi',
    tags: ['URGENT'],
    type: 'featured',
    description: 'Thực hiện kiểm soát chi phí sản xuất, giá thành nguyên vật liệu hạt nhựa và quản lý công nợ khách hàng đối tác nhà phân phối khu vực Miền Bắc. Đối chiếu hóa đơn, chứng từ kế toán chặt chẽ.',
    descriptionEn: 'Manage production cost control, plastic pellet material pricing, and customer receivables for distributors in Northern Vietnam. Reconcile invoices and accounting documents with rigorous standards.',
    requirements: [
      'Tốt nghiệp Cao đẳng/Đại học chuyên ngành Kế toán, Kiểm toán hoặc Tài chính.',
      'Có 2 năm kinh nghiệm kế toán sản xuất hoặc kế toán tổng hợp.',
      'Sử dụng tốt phần mềm kế toán MISA, Bravo và kỹ năng Excel nâng cao.',
      'Tính cách trung thực, cẩn thận, có trách nhiệm cao với số liệu.'
    ],
    requirementsEn: [
      'College/University degree in Accounting, Auditing, or Finance.',
      '2 years of production accounting or general accounting experience.',
      'Proficiency with MISA, Bravo accounting software and advanced Excel skills.',
      'Honest character, attention to detail, and high responsibility for data accuracy.'
    ],
    benefits: [
      'Thu nhập ổn định 10,000,000đ - 12,000,000đ kèm phụ cấp chuyên cần.',
      'Thưởng tết, thưởng lễ đầy đủ theo quy định của tập đoàn lớn hàng đầu Việt Nam.',
      'Môi trường làm việc năng động, chuyên nghiệp, lộ trình thăng tiến rõ ràng lên Kế toán trưởng.',
      'Được tham gia các hoạt động team-building, du lịch xa hoa của tập đoàn.'
    ],
    benefitsEn: [
      'Stable income $430-$520 with diligence allowance.',
      'Full Tet and holiday bonuses per leading Vietnamese conglomerate standards.',
      'Dynamic, professional work environment with clear career path to Chief Accountant.',
      'Participate in team-building activities and luxury company trips.'
    ],
    postedAt: 'Có sẵn',
    skills: ['MISA', 'Kế toán sản xuất', 'Excel']
  },
  {
    id: 'feat-3',
    title: 'Giám Sát Bán Hàng Khu Vực Tây Bắc (Phú Thọ/Vĩnh Phúc)',
    titleEn: 'Sales Supervisor Northwest Region',
    company: 'Công ty TNHH Chế biến thực phẩm Đông Đô',
    logo: 'ĐĐ',
    logoBg: 'bg-amber-600',
    salary: '18 Tr - 25 Tr VND',
    location: 'Vĩnh Phúc',
    locationEn: 'Vinh Phuc',
    tags: ['URGENT'],
    type: 'featured',
    description: 'Chỉ đạo, phát triển mạng lưới kênh phân phối thực phẩm đóng gói đông lạnh (thương hiệu Đôi Đũa Vàng). Tuyển dụng, huấn luyện và giám sát đội ngũ đại diện thương mại (Salesman) đạt chỉ tiêu doanh số đề ra.',
    descriptionEn: 'Direct and develop distribution network for frozen food products. Recruit, train, and supervise sales team to achieve revenue targets.',
    requirements: [
      'Tốt nghiệp Cao đẳng trở lên chuyên ngành Quản trị Kinh doanh, Marketing hoặc tương ứng.',
      'Tối thiểu 2 năm kinh nghiệm ở vị trí Sup/ASM ngành hàng tiêu dùng nhanh (FMCG), ngành thực phẩm.',
      'Thông thuộc thị trường tỉnh Phú Thọ, Vĩnh Phúc, Yên Bái rộng rãi.',
      'Có khả năng đàm phán, giao tiếp tốt và chịu áp lực doanh số cực tốt.'
    ],
    requirementsEn: [
      'College degree or higher in Business Management, Marketing, or related field.',
      'Minimum 2 years Sup/ASM experience in FMCG or food industry.',
      'Extensive knowledge of regional markets.',
      'Strong negotiation and communication skills.'
    ],
    benefits: [
      'Lương cứng 18,000,000đ - 25,000,000đ + Doanh số không giới hạn trần.',
      'Hỗ trợ xăng xe, điện thoại và chi phí tiếp khách đi tỉnh lên tới 4 triệu/tháng.',
      'Hợp đồng lao động đóng BHXH đầy đủ ngay sau khi kết thúc thử việc.',
      'Cơ hội mở rộng kỹ năng quản trị kinh doanh đột phá.'
    ],
    benefitsEn: [
      'Base salary $780-$1,080 plus unlimited commission.',
      'Gas, phone, and customer visit allowance.',
      'Full labor contract with social insurance.',
      'Opportunity to develop management skills.'
    ],
    postedAt: '2 ngày trước',
    skills: ['FMCG', 'Quản lý kênh phân phối', 'Kỹ năng sale']
  },
  {
    id: 'feat-4',
    title: 'SOCIAL MARKETING LEADER',
    titleEn: 'SOCIAL MARKETING LEADER',
    company: 'Công ty TNHH Lê Nom Việt Nam',
    logo: 'LN',
    logoBg: 'bg-purple-600',
    salary: '15 Tr - 20 Tr VND',
    location: 'Hồ Chí Minh',
    locationEn: 'Ho Chi Minh City',
    tags: ['MỚI'],
    type: 'featured',
    description: 'Dẫn dắt phòng Sáng tạo nội dung trên mạng xã hội bao gồm fanpage Facebook, TikTok, Instagram và Threads. Xây dựng chiến lược nội dung viral cho các nhãn hàng thời trang, mỹ phẩm phân khúc cao cấp.',
    descriptionEn: 'Lead social media content creation team across Facebook, TikTok, Instagram, and Threads. Build viral content strategies for premium fashion and beauty brands.',
    requirements: [
      'Cử nhân chuyên ngành Truyền thông, Quan hệ công chúng, Báo chí hoặc liên quan.',
      'Có ít nhất 1 năm kinh nghiệm quản lý đội nhóm sáng tạo hoặc Social Lead tại Agency.',
      'Hiểu rõ thuật toán tối ưu hóa của các nền tảng mạng xã hội lớn hiện nay.',
      'Sở hữu tư duy thẩm mỹ cao, nhạy bén với xu hướng nóng của giới trẻ.'
    ],
    requirementsEn: [
      'Bachelor\'s degree in Communications, Public Relations, or Journalism.',
      'At least 1 year managing creative teams or Social Lead experience.',
      'Deep understanding of social media platform algorithms.',
      'High aesthetic sense and trend awareness.'
    ],
    benefits: [
      'Lương khởi điểm hấp dẫn 15,000,000đ - 20,000,000đ đánh giá định kỳ 6 tháng.',
      'Thưởng hoa hồng theo độ tăng trưởng tương tác từ dự án khách hàng.',
      'Làm việc tại văn phòng tiện nghi trung tâm Quận 1, pantry ngập tràn bánh kẹo free.',
      'Giờ làm việc linh hoạt, trang bị Macbook Pro hiện đại phục vụ thiết kế.'
    ],
    benefitsEn: [
      'Attractive starting salary $650-$860 with 6-month reviews.',
      'Commission bonuses based on interaction growth.',
      'Modern office in central District 1 with unlimited snacks.',
      'Flexible hours and Macbook Pro equipment.'
    ],
    postedAt: 'Vừa xong',
    skills: ['Content Creative', 'Social Strategy', 'TikTok Algorithm']
  },

  // --- VIP JOBS (Việc Làm VIP $1000+) ---
  {
    id: 'vip-1',
    title: 'Senior Golang Engineer / Tech Lead',
    titleEn: 'Senior Golang Engineer / Tech Lead',
    company: 'Nexus HighTech Solutions Việt Nam',
    logo: 'NH',
    logoBg: 'bg-rose-600',
    salary: '35 Tr - 60 Tr VND ($1500 - $2500)',
    location: 'Hồ Chí Minh',
    locationEn: 'Ho Chi Minh City',
    tags: ['VIP', 'MỚI'],
    type: 'vip',
    description: 'Thiết kế, tối ưu cấu trúc hệ thống Backend chịu tải cao cho cổng thanh toán tài chính điện tử thế hệ mới. Trực tiếp refactor các dịch vụ API cũ sang microservices Golang tối tân.',
    descriptionEn: 'Design and optimize high-load Backend system architecture for electronic payment gateway. Refactor legacy API services to modern Golang microservices.',
    requirements: [
      'Hơn 5 năm kinh nghiệm phát triển phần mềmBackend, 3 năm chuyên sâu về Golang.',
      'Hiểu biết sâu rộng về cơ sở dữ liệu Postgres, Redis, Apache Kafka hoặc RabbitMQ.',
      'Kinh nghiệm thành thạo Docker, Kubernetes, CI/CD và kiến trúc mạng Cloud (AWS/GCP).',
      'Đọc viết tiếng Anh thuần thục làm việc trực tiếp với Product Manager nước ngoài.'
    ],
    requirementsEn: [
      'Over 5 years backend software development, 3 years Golang expertise.',
      'Deep knowledge of Postgres, Redis, Apache Kafka, or RabbitMQ.',
      'Proficiency with Docker, Kubernetes, CI/CD, and Cloud architecture.',
      'Fluent English for collaboration with foreign Product Managers.'
    ],
    benefits: [
      'Gói thu nhập khủng lên đến 60 triệu đồng kèm tháng lương thứ 14 siêu đỉnh.',
      'Hỗ trợ trang bị máy tính tự chọn, trợ cấp làm việc hybrid linh động tại nhà.',
      'Khóa đào tạo chuyên sâu về System Design trực tiếp từ chuyên gia Thung lũng Silicon.',
      'Tặng 15 ngày phép có lương cùng chế độ chăm sóc y tế toàn diện cho cả gia đình.'
    ],
    benefitsEn: [
      'Massive salary up to $2,600 with month 14 bonus.',
      'Equipment choice and flexible hybrid work allowance.',
      'System Design training from Silicon Valley experts.',
      '15 days paid leave with comprehensive family healthcare.'
    ],
    postedAt: 'Có sẵn',
    skills: ['Golang', 'Kubernetes', 'System Design', 'Microservices']
  },
  {
    id: 'vip-2',
    title: 'Director of Engineering (Tech Manager)',
    titleEn: 'Director of Engineering (Tech Manager)',
    company: 'CoreGroup Software Global',
    logo: 'CG',
    logoBg: 'bg-teal-600',
    salary: '80 Tr - 120 Tr VND ($3500+)',
    location: 'Hà Nội',
    locationEn: 'Hanoi',
    tags: ['VIP', 'URGENT'],
    type: 'vip',
    description: 'Quản lý toàn bộ nguồn lực và định hướng phát triển công nghệ cho 4 dự án phần mềm y tế SaaS quy mô quốc tế. Hỗ trợ kết nối các phòng ban từ nghiên cứu đến vận hành.',
    descriptionEn: 'Manage all resources and guide technology development for 4 international-scale healthcare SaaS projects. Support collaboration between research and operations.',
    requirements: [
      'Hơn 8 năm quản lý và dẫn dắt đội ngũ kỹ sư quy mô tối thiểu 30 thành viên.',
      'Khả năng định hướng công nghệ xuất sắc trong React, Node.js, Python AI.',
      'Chứng chỉ hoặc kinh nghiệm quản lý Agile/Scrum bài bản.',
      'Kỹ năng lãnh đạo, hòa giải xung đột và ngoại giao thuyết trình xuất sắc.'
    ],
    requirementsEn: [
      'Over 8 years managing engineering teams of 30+ members.',
      'Excellent technology direction in React, Node.js, Python AI.',
      'Formal Agile/Scrum management certification or experience.',
      'Exceptional leadership and diplomatic skills.'
    ],
    benefits: [
      'Thu nhập bứt phá lên tới 120 triệu mỗi tháng kèm quỹ cổ phiếu ESOP hấp dẫn.',
      'Du lịch công tác Mỹ/Châu Âu 1-2 lần mỗi năm để chuyển giao công nghệ mới.',
      'Không gian làm việc văn phòng 5 sao view Hồ Tây khoáng đạt.'
    ],
    benefitsEn: [
      'Breakthrough income up to $5,200/month with ESOP stock fund.',
      'Business travel to US/Europe 1-2 times yearly.',
      '5-star office workspace with stunning views.'
    ],
    postedAt: '5 ngày trước',
    skills: ['Leadership', 'SaaS Business', 'AI Development']
  },

  // --- HEADHUNTER JOBS (Việc Làm Từ Top Headhunter) ---
  {
    id: 'head-1',
    title: 'Senior DevOps Architect (AWS/Kubernetes)',
    titleEn: 'Senior DevOps Architect (AWS/Kubernetes)',
    company: 'TalentFinder Headhunter Agency',
    logo: 'TF',
    logoBg: 'bg-indigo-600',
    salary: '45 Tr - 70 Tr VND',
    location: 'Đà Nẵng',
    tags: ['HEADHUNTER'],
    type: 'headhunter',
    description: 'Xây dựng cơ sở hạ tầng tự động hóa quy mô lớn trên hệ sinh thái điện toán đám mây cho một tập đoàn viễn thông hàng đầu Việt Nam. Phát triển kịch bản Terraform tự động hóa.',
    descriptionEn: 'Build large-scale infrastructure automation on cloud ecosystem for leading Vietnamese telecom. Develop Terraform automation scripts.',
    requirements: [
      'Kinh nghiệm thực chiến triển khai Ansible, Terraform, Jenkins, GitlabCI.',
      'Sở hữu chứng chỉ nâng cao AWS Solutions Architect Professional hoặc CKA (Kubernetes).',
      'Có tư duy tối ưu chi phí hạ tầng thông minh.'
    ],
    requirementsEn: [
      'Hands-on experience deploying Ansible, Terraform, Jenkins, GitlabCI.',
      'AWS Solutions Architect Professional or CKA certification.',
      'Smart infrastructure cost optimization mindset.'
    ],
    benefits: [
      'Mức đãi ngộ cực khủng, hỗ trợ tái định cư cho ứng viên chuyển vùng về Đà Nẵng.',
      'Môi trường đa văn hóa thân thiện, thoải mái.'
    ],
    benefitsEn: [
      'Extremely attractive compensation with relocation support to Da Nang.',
      'Friendly, comfortable multicultural environment.'
    ],
    postedAt: '3 ngày trước',
    skills: ['Terraform', 'DevOps', 'AWS Cloud', 'Ansible']
  },
  {
    id: 'head-2',
    title: 'AI/ML Specialist (Deep Learning focus)',
    titleEn: 'AI/ML Specialist (Deep Learning focus)',
    company: 'Anphabe HighTech Headhunt',
    logo: 'AP',
    logoBg: 'bg-cyan-600',
    salary: '70 Tr - 95 Tr VND',
    location: 'Hồ Chí Minh',
    tags: ['HEADHUNTER', 'MỚI'],
    type: 'headhunter',
    description: 'Nghiên cứu ứng dụng các thuật toán Học máy, Nhận diện khuôn mặt và Xử lý ngôn ngữ tự nhiên tối ưu hóa hệ thống chatbot và tìm kiếm sản phẩm cho sàn thương mại điện tử lớn.',
    descriptionEn: 'Research and apply Machine Learning, Face Recognition, and NLP algorithms to optimize chatbot and product search for major e-commerce platform.',
    requirements: [
      'Thạc sĩ hoặc Tiến sĩ ngành Khoa học Máy tính, Trí tuệ Nhân tạo.',
      'Sử dụng thành thạo PyTorch, TensorFlow, OpenCV, HuggingFace.'
    ],
    requirementsEn: [
      'Master\'s or Ph.D. in Computer Science or Artificial Intelligence.',
      'Proficiency with PyTorch, TensorFlow, OpenCV, HuggingFace.'
    ],
    benefits: [
      'Mức lương khởi điểm thương lượng ở mức siêu cao 95M VND.',
      'Đại diện tập đoàn tham gia hội nghị quốc tế về AI.'
    ],
    benefitsEn: [
      'Negotiable ultra-high starting salary 95M VND.',
      'Represent conglomerate at international AI conferences.'
    ],
    postedAt: 'Có sẵn',
    skills: ['NLP', 'PyTorch', 'TensorFlow', 'Deep Learning']
  }
];

// Generates multiple mock jobs to make pagination interesting 
export const ALL_NUMERIC_PAGES_JOBS: Record<number, Job[]> = {
  4: [
    {
      id: 'page4-1',
      title: 'Quản Lý Dự Án Xây Dựng Cầu Đường',
      titleEn: 'Construction Bridge Road Project Manager',
      company: 'CÔNG TY CP ĐẦU TƯ ĐÈO CẢ',
      logo: 'DC',
      logoBg: 'bg-zinc-700',
      salary: '25 Tr - 35 Tr VND',
      location: 'Hà Nội',
      tags: ['POPULAR'],
      type: 'featured',
      description: 'Giám sát chỉ đạo dự án xây dựng hầm đường bộ cao tốc thông minh khu vực miền Trung, đảm bảo kỹ thuật hàng đầu.',
      descriptionEn: 'Supervise and direct smart highway tunnel construction project in Central Vietnam, ensuring top technical standards.',
      requirements: ['Kinh nghiệm 5 năm quản lý dự án công trình giao thông trọng điểm.'],
      requirementsEn: ['5 years experience managing major transportation construction projects.'],
      benefits: ['Lương bổng xứng tầm, được đài thọ đi công tác biệt đãi.'],
      benefitsEn: ['Commensurate salary, special business travel benefits.'],
      postedAt: '3 ngày trước',
      skills: ['Project Management', 'Construction']
    },
    {
      id: 'page4-2',
      title: 'Chuyên viên Tư vấn Thuế cấp cao',
      titleEn: 'Senior Tax Consultant',
      company: 'Deloitte Vietnam Enterprise',
      logo: 'DL',
      logoBg: 'bg-green-700',
      salary: '20 Tr - 30 Tr VND',
      location: 'Hồ Chí Minh',
      tags: ['VIP'],
      type: 'featured',
      description: 'Quản trị các rủi ro sắc thuế doanh nghiệp có vốn đầu tư nước ngoài FDI, tư vấn chiến lược báo cáo tài chính chuẩn mực.',
      descriptionEn: 'Manage tax risks for FDI enterprises, advise on financial reporting strategy and compliance.',
      requirements: ['Bằng kiểm toán viên CPA Việt Nam hoặc ACCA.'],
      requirementsEn: ['Vietnamese CPA or ACCA certification.'],
      benefits: ['Làm việc trong Big 4, tăng trưởng nghề nghiệp đẳng cấp quốc tế.'],
      benefitsEn: ['Work in Big 4, international-level career growth.'],
      postedAt: '4 ngày trước',
      skills: ['Tax Advisory', 'CPA', 'Audit']
    }
  ],
  5: [
    {
      id: 'page5-1',
      title: 'Senior Business Analyst (BA)',
      titleEn: 'Senior Business Analyst (BA)',
      company: 'FPT Software Global Business',
      logo: 'FS',
      logoBg: 'bg-orange-600',
      salary: '22 Tr - 35 Tr VND',
      location: 'Đà Nẵng',
      tags: ['MỚI'],
      type: 'vip',
      description: 'Cầu nối khảo sát yêu cầu khách hàng Nhật Bản, Âu Mỹ và đội ngũ lập trình viên thiết kế phần mềm ô tô thông minh.',
      descriptionEn: 'Bridge client requirements from Japan and US with programming team for smart automotive software design.',
      requirements: ['Khả năng tiếng Anh trôi chảy và thành thạo UML, Jira.'],
      requirementsEn: ['Fluent English and proficiency with UML, Jira.'],
      benefits: ['Nghỉ dưỡng resort hằng năm cùng chế độ đãi ngộ 14 tháng lương cứng.'],
      benefitsEn: ['Annual resort vacation with 14-month salary package.'],
      postedAt: '5 ngày trước',
      skills: ['Jira', 'Agile Product', 'English Communication']
    }
  ],
  6: [
    {
      id: 'page6-1',
      title: 'Graphic Designer Professional',
      titleEn: 'Graphic Designer Professional',
      company: 'Be Group Vietnam JSC',
      logo: 'BE',
      logoBg: 'bg-yellow-500',
      salary: '16 Tr - 22 Tr VND',
      location: 'Hồ Chí Minh',
      tags: ['MỚI'],
      type: 'featured',
      description: 'Phác thảo, biến hóa nhận diện sáng tạo kỹ thuật số cho siêu ứng dụng gọi xe hàng đầu Be.',
      descriptionEn: 'Design and create digital creative identity for leading Be ride-hailing super app.',
      requirements: ['Portfolio sáng tạo đầy màu sắc, am hiểu Illustrator và Premiere Pro.'],
      requirementsEn: ['Colorful creative portfolio, proficiency with Illustrator and Premiere Pro.'],
      benefits: ['Sử dụng coupon di chuyển Be thả ga, hỗ trợ laptop hiện đại.'],
      benefitsEn: ['Unlimited Be ride coupons, modern laptop support.'],
      postedAt: '6 ngày trước',
      skills: ['UI Design', 'Illustrator', 'Video Editing']
    }
  ]
};

export const RECRUITERS: Recruiter[] = [
  { id: '1', name: 'Google Inc.', logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80', industry: 'Công nghệ thông tin' },
  { id: '2', name: 'FPT Corporation', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80', industry: 'Tích hợp hệ thống' },
  { id: '3', name: 'Vingroup JSC', logo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80', industry: 'Đa ngành, Bất động sản' },
  { id: '4', name: 'Techcombank', logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=150&q=80', industry: 'Tài chính - Ngân hàng' },
  { id: '5', name: 'Viettel Telecom', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80', industry: 'Viễn thông & Công nghệ' },
  { id: '6', name: 'HDBank Group', logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=150&q=80', industry: 'Ngân hàng thương mại' }
];

export const CATEGORY_JOBS = {
  sales_business: [
    { title: 'HCM - Giám Đốc/Chuyên Viên Quan Hệ Khách Hàng', company: 'Ngân Hàng TMCP Á Châu (ACB)', link: '#' },
    { title: 'SALES LEADER NỘI THẤT HÀ NỘI', company: 'CÔNG TY TNHH NIPPON INTERIA', link: '#' },
    { title: 'Chuyên viên Phát triển Đối tác Doanh nghiệp', company: 'Shopee Vietnam', link: '#' }
  ],
  marketing_creative: [
    { title: 'Chuyên viên Digital Marketing', company: 'CÔNG TY CỔ PHẦN ĐIỆN CƠ THỐNG NHẤT', link: '#' },
    { title: 'Trưởng phòng Marketing', company: 'CÔNG TY CỔ PHẦN ĐIỆN CƠ THỐNG NHẤT', link: '#' },
    { title: 'Content Creator (Xây dựng kênh TikTok)', company: 'Garena Vietnam', link: '#' }
  ],
  admin_hr: [
    { title: 'Admin', company: 'Techtronic Industries Vietnam', link: '#' },
    { title: 'Nhân viên Nhân sự - Hành chính', company: 'CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ QUỐC TẾ', link: '#' },
    { title: 'Trợ lý Giám đốc Ban Dự án', company: 'Vinhomes Joint Stock Company', link: '#' }
  ]
};

export const HANDBOOK_ARTICLES: HandbookArticle[] = [
  {
    id: 'art-1',
    title: 'Bí quyết viết CV ấn tượng thu hút nhà tuyển dụng ngay từ cái nhìn đầu tiên',
    excerpt: 'Làm sao để hồ sơ xin việc của bạn vượt qua hàng trăm ứng viên khác để lọt vào mắt xanh của nhà tuyển dụng? Khám phá ngay 5 mẹo tối ưu hóa từ bố cục, từ khóa chuyên môn đến cách trình bày thành tựu vượt trội giúp định vị năng lực bản thân một cách chuyên nghiệp tối đa.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
    category: 'Viết CV',
    readTime: '5 phút đọc'
  },
  {
    id: 'art-2',
    title: 'Kỹ năng phỏng vấn: Làm sao để tự tin trả lời các câu hỏi khó?',
    excerpt: 'Bạn thường lúng túng khi gặp các câu hỏi ứng biến về nhược điểm, mức lương mong muốn hay mâu thuẫn với sếp cũ? Tìm hiểu các công thức vàng STAR và phương pháp trả lời khôn ngoan, giúp biến thách thức thành cơ hội chứng tỏ phong thái chuyên nghiệp.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
    category: 'Phỏng vấn',
    readTime: '7 phút đọc'
  },
  {
    id: 'art-3',
    title: 'Định hướng nghề nghiệp: Chọn đúng ngành, đi đúng hướng cho tương lai',
    excerpt: 'Khủng hoảng tuổi đôi mươi và băn khoăn lựa chọn hướng đi phù hợp với bản thân. Bài viết cung cấp mô hình IKIGAI thực tiễn giúp đánh giá khách quan năng lực nội tại, đam mê cá nhân cùng nhu cầu xã hội để hoạch định dài hạn.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    category: 'Định hướng',
    readTime: '8 phút đọc'
  }
];

export const KEY_INDUSTRIES = [
  { id: 'ind-1', name: 'Nhân sự', nameEn: 'Human Resources', count: 1486 },
  { id: 'ind-2', name: 'Kế toán / Kiểm toán', nameEn: 'Accounting / Audit', count: 3295 },
  { id: 'ind-3', name: 'Bán lẻ / Bán sỉ', nameEn: 'Retail / Wholesale', count: 1725 },
  { id: 'ind-4', name: 'Tài chính / Đầu tư', nameEn: 'Finance / Investment', count: 2666 },
  { id: 'ind-5', name: 'Ngân hàng', nameEn: 'Banking', count: 4197 }
];

export const RECRUITER_LOGOS_GRID = [
  { id: 'rgr-1', name: 'HDBank Golden', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=200&q=80' },
  { id: 'rgr-2', name: 'FIT HR Staffing', image: 'https://images.unsplash.com/photo-1573497491208-6b1acb260532?auto=format&fit=crop&w=200&q=80' },
  { id: 'rgr-3', name: 'Việt Travel Cruise', image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=200&q=80' },
  { id: 'rgr-4', name: 'IDG Technology Ventures', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=200&q=80' },
  { id: 'rgr-5', name: 'FPT Software Smart Work', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=200&q=80' }
];
