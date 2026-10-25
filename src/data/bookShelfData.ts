import { BookItem } from '../types/spelling';

export const DEFAULT_BOOKSHELF: BookItem[] = [
  // ==========================================
  // TIỂU HỌC: LỚP 1
  // ==========================================
  {
    id: 'book_ket_noi_1',
    title: 'Tiếng Việt 1 - Kết Nối Tri Thức',
    publisher: 'NXB Giáo Dục Việt Nam',
    grade: 'Lớp 1 - Tập 2',
    gradeLevel: 1,
    coverBg: 'from-sky-500 via-blue-600 to-indigo-700',
    coverIcon: '📘',
    description: 'Bộ sách Kết nối tri thức với cuộc sống. Bài đọc mẫu chuẩn âm vần và câu văn trong sáng cho học sinh lớp 1.',
    sections: [
      {
        id: 'sec_kn_1',
        sectionNumber: 'Mục 1',
        title: 'Chú gà trống chăm chỉ',
        authorOrSource: 'Trang 24 - Bài đọc tuần 19',
        fullText: 'Sáng sớm, chú gà trống cất tiếng gáy vang: ò ó o. Đánh thức bác nông dân và các bạn nhỏ dậy đi học.',
        paragraphs: [
          'Sáng sớm, chú gà trống cất tiếng gáy vang: ò... ó... o...',
          'Đánh thức bác nông dân và các bạn nhỏ dậy đi học.',
        ],
        chunks: [
          'Sáng sớm,',
          'chú gà trống',
          'cất tiếng gáy vang:',
          'ò... ó... o...',
          'Đánh thức bác nông dân',
          'và các bạn nhỏ',
          'dậy đi học.',
        ],
        guideNotes: 'Chú ý viết hoa đầu câu, dấu phẩy sau chữ "Sáng sớm", từ "gà trống" viết bằng tr.',
        emoji: '🐓',
      },
      {
        id: 'sec_kn_2',
        sectionNumber: 'Mục 2',
        title: 'Cây bàng trường em',
        authorOrSource: 'Trang 38 - Bài đọc tuần 22',
        fullText: 'Cây bàng trường em tỏa bóng mát rượi. Mùa xuân, lộc non nhú xanh biếc. Mùa thu, lá bàng đỏ rực một góc sân trường.',
        paragraphs: [
          'Cây bàng trường em tỏa bóng mát rượi.',
          'Mùa xuân, lộc non nhú xanh biếc.',
          'Mùa thu, lá bàng đỏ rực một góc sân trường.',
        ],
        chunks: [
          'Cây bàng trường em',
          'tỏa bóng mát rượi.',
          'Mùa xuân,',
          'lộc non nhú xanh biếc.',
          'Mùa thu,',
          'lá bàng đỏ rực',
          'một góc sân trường.',
        ],
        guideNotes: 'Từ "bàng" có vần ang, "trường em" viết bằng tr, "mát rượi" viết bằng r.',
        emoji: '🌳',
      },
      {
        id: 'sec_kn_3',
        sectionNumber: 'Mục 3',
        title: 'Đầm sen quê ngoại',
        authorOrSource: 'Trang 52 - Bài đọc tuần 25',
        fullText: 'Đầm sen quê ngoại nở rộ thơm ngát. Hoa sen hồng thắm, nhị vàng óng ả. Lá sen xòe tròn che mát đàn cá tung tăng bơi lội.',
        paragraphs: [
          'Đầm sen quê ngoại nở rộ thơm ngát.',
          'Hoa sen hồng thắm, nhị vàng óng ả.',
          'Lá sen xòe tròn che mát đàn cá tung tăng bơi lội.',
        ],
        chunks: [
          'Đầm sen quê ngoại',
          'nở rộ thơm ngát.',
          'Hoa sen hồng thắm,',
          'nhị vàng óng ả.',
          'Lá sen xòe tròn',
          'che mát đàn cá',
          'tung tăng bơi lội.',
        ],
        guideNotes: 'Từ "sen" viết bằng s cong lưỡi, "xòe tròn" viết bằng x và tr.',
        emoji: '🪷',
      },
    ],
  },
  {
    id: 'book_canh_dieu_1',
    title: 'Tiếng Việt 1 - Cánh Diều',
    publisher: 'NXB Đại Học Sư Phạm',
    grade: 'Lớp 1 - Tập 2',
    gradeLevel: 1,
    coverBg: 'from-amber-500 via-orange-500 to-red-600',
    coverIcon: '🪁',
    description: 'Bộ sách Cánh Diều. Các bài đọc sinh động gắn liền với gia đình, thiên nhiên và cuộc sống thường nhật của bé.',
    sections: [
      {
        id: 'sec_cd_1',
        sectionNumber: 'Mục 1',
        title: 'Bé đi chợ cùng mẹ',
        authorOrSource: 'Trang 18 - Bài chính tả',
        fullText: 'Chợ quê buổi sớm rất nhộn nhịp. Mẹ mua cá tươi, rau xanh và cam ngọt. Bé vui vẻ xách giỏ đỡ mẹ.',
        paragraphs: [
          'Chợ quê buổi sớm rất nhộn nhịp.',
          'Mẹ mua cá tươi, rau xanh và cam ngọt.',
          'Bé vui vẻ xách giỏ đỡ mẹ.',
        ],
        chunks: [
          'Chợ quê buổi sớm',
          'rất nhộn nhịp.',
          'Mẹ mua cá tươi,',
          'rau xanh',
          'và cam ngọt.',
          'Bé vui vẻ',
          'xách giỏ đỡ mẹ.',
        ],
        guideNotes: 'Từ "chợ quê" viết bằng ch, "xách giỏ" viết bằng x và gi, "nhộn nhịp" dấu nặng.',
        emoji: '🛒',
      },
      {
        id: 'sec_cd_2',
        sectionNumber: 'Mục 2',
        title: 'Chú trâu trên cánh đồng',
        authorOrSource: 'Trang 46 - Bài tập đọc',
        fullText: 'Trên đồng cỏ xanh bát ngát, chú trâu thong thả gặm cỏ non. Cánh cò trắng phau chao liệng bay trên nền trời biếc.',
        paragraphs: [
          'Trên đồng cỏ xanh bát ngát, chú trâu thong thả gặm cỏ non.',
          'Cánh cò trắng phau chao liệng bay trên nền trời biếc.',
        ],
        chunks: [
          'Trên đồng cỏ xanh bát ngát,',
          'chú trâu thong thả',
          'gặm cỏ non.',
          'Cánh cò trắng phau',
          'chao liệng bay',
          'trên nền trời biếc.',
        ],
        guideNotes: 'Từ "chú trâu" có tr cong lưỡi, "trắng phau" viết bằng tr, "chao liệng" viết bằng ch.',
        emoji: '🐃',
      },
    ],
  },

  // ==========================================
  // TIỂU HỌC: LỚP 2
  // ==========================================
  {
    id: 'book_lop_2',
    title: 'Tiếng Việt 2 - Cánh Diều',
    publisher: 'NXB Đại Học Sư Phạm',
    grade: 'Lớp 2 - Tập 1 & 2',
    gradeLevel: 2,
    coverBg: 'from-emerald-500 via-teal-600 to-cyan-700',
    coverIcon: '🌱',
    description: 'Chương trình Tiếng Việt lớp 2 rèn kỹ năng viết câu hoàn chỉnh, mở rộng vốn từ và phân biệt cặp âm vần nâng cao.',
    sections: [
      {
        id: 'sec_l2_1',
        sectionNumber: 'Bài 1',
        title: 'Em là học sinh lớp 2',
        authorOrSource: 'Trang 12 - Tiếng Việt 2',
        fullText: 'Hôm nay em là học sinh lớp 2. Em mặc bộ quần áo mới tinh, tay cầm cặp sách bước chân rộn rã trên con đường quen thuộc đến trường.',
        paragraphs: [
          'Hôm nay em là học sinh lớp 2.',
          'Em mặc bộ quần áo mới tinh.',
          'Tay cầm cặp sách bước chân rộn rã trên con đường quen thuộc đến trường.',
        ],
        chunks: [
          'Hôm nay',
          'em là học sinh lớp 2.',
          'Em mặc bộ quần áo mới tinh,',
          'tay cầm cặp sách',
          'bước chân rộn rã',
          'trên con đường quen thuộc',
          'đến trường.',
        ],
        guideNotes: 'Chú ý: "rộn rã" viết bằng r, "quen thuộc" có vần uôc, "quần áo" viết bằng qu.',
        emoji: '🎒',
      },
      {
        id: 'sec_l2_2',
        sectionNumber: 'Bài 2',
        title: 'Bông hoa niềm vui',
        authorOrSource: 'Trang 40 - Bài tập đọc',
        fullText: 'Chi bước vào vườn hoa của trường. Bông cúc đại đóa màu xanh lộng lẫy hé nở dưới ánh nắng sớm. Chi muốn hái hoa tặng bố đang ốm nhưng em không dám bẻ cành.',
        paragraphs: [
          'Chi bước vào vườn hoa của trường.',
          'Bông cúc đại đóa màu xanh lộng lẫy hé nở dưới ánh nắng sớm.',
          'Chi muốn hái hoa tặng bố đang ốm nhưng em không dám bẻ cành.',
        ],
        chunks: [
          'Chi bước vào vườn hoa của trường.',
          'Bông cúc đại đóa màu xanh lộng lẫy',
          'hé nở dưới ánh nắng sớm.',
          'Chi muốn hái hoa tặng bố đang ốm',
          'nhưng em không dám bẻ cành.',
        ],
        guideNotes: 'Viết hoa tên riêng Chi, chú ý từ "lộng lẫy" l cao, "bước vào" vần ưoc.',
        emoji: '🌼',
      },
    ],
  },

  // ==========================================
  // TIỂU HỌC: LỚP 3
  // ==========================================
  {
    id: 'book_lop_3',
    title: 'Tiếng Việt 3 - Kết Nối Tri Thức',
    publisher: 'NXB Giáo Dục Việt Nam',
    grade: 'Lớp 3 - Tập 1 & 2',
    gradeLevel: 3,
    coverBg: 'from-violet-600 via-purple-600 to-indigo-700',
    coverIcon: '🌟',
    description: 'Rèn luyện đoạn văn miêu tả thiên nhiên quê hương, kỹ năng nghe viết chính tả chuẩn mực cho học sinh lớp 3.',
    sections: [
      {
        id: 'sec_l3_1',
        sectionNumber: 'Bài 1',
        title: 'Mùa hè lấp lánh',
        authorOrSource: 'Trang 10 - Tiếng Việt 3',
        fullText: 'Sớm mai thức dậy, em thấy mặt trời đã rải ánh vàng rực rỡ khắp sân nhà. Tiếng ve ngân vang trong vòm lá sấu già. Mùa hè mang theo những quả chín mọng và dòng sông mát rượi.',
        paragraphs: [
          'Sớm mai thức dậy, em thấy mặt trời đã rải ánh vàng rực rỡ khắp sân nhà.',
          'Tiếng ve ngân vang trong vòm lá sấu già.',
          'Mùa hè mang theo những quả chín mọng và dòng sông mát rượi.',
        ],
        chunks: [
          'Sớm mai thức dậy,',
          'em thấy mặt trời',
          'đã rải ánh vàng rực rỡ',
          'khắp sân nhà.',
          'Tiếng ve ngân vang',
          'trong vòm lá sấu già.',
          'Mùa hè mang theo',
          'những quả chín mọng',
          'và dòng sông mát rượi.',
        ],
        guideNotes: 'Từ "rực rỡ", "rải ánh vàng", "mát rượi" đều viết bằng r; "sấu già" viết bằng s và gi.',
        emoji: '☀️',
      },
    ],
  },

  // ==========================================
  // TIỂU HỌC: LỚP 4
  // ==========================================
  {
    id: 'book_lop_4',
    title: 'Tiếng Việt 4 - Cánh Diều',
    publisher: 'NXB Đại Học Sư Phạm',
    grade: 'Lớp 4 - Tập 1 & 2',
    gradeLevel: 4,
    coverBg: 'from-orange-500 via-rose-500 to-pink-600',
    coverIcon: '⛵',
    description: 'Chính tả và tập làm văn lớp 4 với các bài văn tả cảnh sông nước, con người và thiên nhiên giàu nhạc điệu.',
    sections: [
      {
        id: 'sec_l4_1',
        sectionNumber: 'Bài 1',
        title: 'Bè xuôi sông La',
        authorOrSource: 'Thơ Vũ Duy Thông',
        fullText: 'Bè ta xuôi sông La, dẻ cau cùng táu mật, muồng đen và trai đất, lát thun rồi lát hoa. Sông La ơi sông La, trong veo như ánh mắt, bờ tre xanh im mát, mươn mướt đôi hàng mi.',
        paragraphs: [
          'Bè ta xuôi sông La, dẻ cau cùng táu mật, muồng đen và trai đất, lát thun rồi lát hoa.',
          'Sông La ơi sông La, trong veo như ánh mắt, bờ tre xanh im mát, mươn mướt đôi hàng mi.',
        ],
        chunks: [
          'Bè ta xuôi sông La,',
          'dẻ cau cùng táu mật,',
          'muồng đen và trai đất,',
          'lát thun rồi lát hoa.',
          'Sông La ơi sông La,',
          'trong veo như ánh mắt,',
          'bờ tre xanh im mát,',
          'mươn mướt đôi hàng mi.',
        ],
        guideNotes: 'Viết hoa tên riêng sông La; phân biệt "trai đất" (tr) với chài; "mươn mướt" vần ươt.',
        emoji: '🌊',
      },
    ],
  },

  // ==========================================
  // TIỂU HỌC: LỚP 5
  // ==========================================
  {
    id: 'book_lop_5',
    title: 'Tiếng Việt 5 - Kết Nối Tri Thức',
    publisher: 'NXB Giáo Dục Việt Nam',
    grade: 'Lớp 5 - Tập 1 & 2',
    gradeLevel: 5,
    coverBg: 'from-teal-600 via-emerald-600 to-green-700',
    coverIcon: '🌾',
    description: 'Trích đoạn các tác phẩm văn học mẫu mực, nâng cao vốn từ ngữ biểu cảm và sự chuẩn xác từng dấu câu.',
    sections: [
      {
        id: 'sec_l5_1',
        sectionNumber: 'Bài 1',
        title: 'Quang cảnh làng mạc ngày mùa',
        authorOrSource: 'Tô Hoài',
        fullText: 'Mùa đông, giữa ngày mùa, làng quê toàn màu vàng, những màu vàng rất khác nhau. Màu lúa chín dưới đồng vàng xuộm lại. Nắng nhạt ngả màu vàng hoe. Từng chiếc lá mít vàng ối.',
        paragraphs: [
          'Mùa đông, giữa ngày mùa, làng quê toàn màu vàng, những màu vàng rất khác nhau.',
          'Màu lúa chín dưới đồng vàng xuộm lại.',
          'Nắng nhạt ngả màu vàng hoe. Từng chiếc lá mít vàng ối.',
        ],
        chunks: [
          'Mùa đông, giữa ngày mùa,',
          'làng quê toàn màu vàng,',
          'những màu vàng rất khác nhau.',
          'Màu lúa chín dưới đồng',
          'vàng xuộm lại.',
          'Nắng nhạt ngả màu vàng hoe.',
          'Từng chiếc lá mít vàng ối.',
        ],
        guideNotes: 'Các tính từ chỉ sắc vàng tinh tế: "vàng xuộm" (x), "vàng hoe", "vàng ối".',
        emoji: '🌾',
      },
    ],
  },

  // ==========================================
  // THCS: LỚP 6
  // ==========================================
  {
    id: 'book_lop_6',
    title: 'Ngữ Văn 6 - Chân Trời Sáng Tạo',
    publisher: 'NXB Giáo Dục Việt Nam',
    grade: 'Lớp 6 - Tập 1 & 2',
    gradeLevel: 6,
    coverBg: 'from-cyan-600 via-blue-600 to-indigo-800',
    coverIcon: '🦗',
    description: 'Trích đoạn kinh điển mở đầu cấp THCS: Dế Mèn phiêu lưu ký, truyện cổ tích và truyền thuyết hào hùng.',
    sections: [
      {
        id: 'sec_l6_1',
        sectionNumber: 'Văn bản 1',
        title: 'Bài học đường đời đầu tiên',
        authorOrSource: 'Tô Hoài - Trích Dế Mèn phiêu lưu ký',
        fullText: 'Bởi tôi ăn uống điều độ và làm việc có chừng mực nên tôi chóng lớn lắm. Chẳng bao lâu, tôi đã trở thành một chàng dế thanh niên cường tráng. Đôi càng tôi mẫm bóng. Những cái vuốt ở chân, ở khoeo cứ cứng dần và nhọn hoắt.',
        paragraphs: [
          'Bởi tôi ăn uống điều độ và làm việc có chừng mực nên tôi chóng lớn lắm.',
          'Chẳng bao lâu, tôi đã trở thành một chàng dế thanh niên cường tráng.',
          'Đôi càng tôi mẫm bóng. Những cái vuốt ở chân, ở khoeo cứ cứng dần và nhọn hoắt.',
        ],
        chunks: [
          'Bởi tôi ăn uống điều độ',
          'và làm việc có chừng mực',
          'nên tôi chóng lớn lắm.',
          'Chẳng bao lâu,',
          'tôi đã trở thành',
          'một chàng dế thanh niên',
          'cường tráng.',
          'Đôi càng tôi mẫm bóng.',
          'Những cái vuốt ở chân, ở khoeo',
          'cứ cứng dần và nhọn hoắt.',
        ],
        guideNotes: 'Từ ngữ miêu tả sinh động: "cường tráng" (tr), "mẫm bóng" (dấu ngã), "nhọn hoắt" (oat).',
        emoji: '🦗',
      },
    ],
  },

  // ==========================================
  // THCS: LỚP 7
  // ==========================================
  {
    id: 'book_lop_7',
    title: 'Ngữ Văn 7 - Kết Nối Tri Thức',
    publisher: 'NXB Giáo Dục Việt Nam',
    grade: 'Lớp 7 - Tập 1 & 2',
    gradeLevel: 7,
    coverBg: 'from-amber-600 via-orange-600 to-red-700',
    coverIcon: '🛶',
    description: 'Văn học trung đại và hiện đại, tuỳ bút, ký và thơ trữ tình sâu lắng của quê hương đất nước.',
    sections: [
      {
        id: 'sec_l7_1',
        sectionNumber: 'Văn bản 1',
        title: 'Đi lấy mật (Đất rừng phương Nam)',
        authorOrSource: 'Đoàn Giỏi',
        fullText: 'Rừng cây im lặng quá. Một tiếng lá rơi lúc này cũng có thể khiến người ta giật mình. Chim hót líu lo. Nắng bốc hương hoa tràm thơm ngây ngất. Gió đưa mùi hương ngọt ngào, thoang thoảng bay khắp rừng.',
        paragraphs: [
          'Rừng cây im lặng quá. Một tiếng lá rơi lúc này cũng có thể khiến người ta giật mình.',
          'Chim hót líu lo. Nắng bốc hương hoa tràm thơm ngây ngất.',
          'Gió đưa mùi hương ngọt ngào, thoang thoảng bay khắp rừng.',
        ],
        chunks: [
          'Rừng cây im lặng quá.',
          'Một tiếng lá rơi lúc này',
          'cũng có thể',
          'khiến người ta giật mình.',
          'Chim hót líu lo.',
          'Nắng bốc hương hoa tràm',
          'thơm ngây ngất.',
          'Gió đưa mùi hương ngọt ngào,',
          'thoang thoảng bay khắp rừng.',
        ],
        guideNotes: 'Từ láy: "thoang thoảng", "líu lo", "ngọt ngào"; chú ý "hoa tràm" viết bằng tr.',
        emoji: '🌳',
      },
    ],
  },

  // ==========================================
  // THCS: LỚP 8
  // ==========================================
  {
    id: 'book_lop_8',
    title: 'Ngữ Văn 8 - Cánh Diều',
    publisher: 'NXB Đại Học Sư Phạm',
    grade: 'Lớp 8 - Tập 1 & 2',
    gradeLevel: 8,
    coverBg: 'from-rose-600 via-purple-700 to-indigo-800',
    coverIcon: '🍁',
    description: 'Truyện ngắn hiện thực phê phán và hồi ký giàu giá trị nhân đạo sâu sắc: Tôi đi học, Lão Hạc, Chiếc lá cuối cùng.',
    sections: [
      {
        id: 'sec_l8_1',
        sectionNumber: 'Văn bản 1',
        title: 'Tôi đi học',
        authorOrSource: 'Thanh Tịnh',
        fullText: 'Hằng năm cứ vào cuối thu, lá ngoài đường rụng nhiều và trên không có những đám mây bàng bạc, lòng tôi lại nao nức những kỷ niệm mơn man của buổi tựu trường. Tôi quên thế nào được những cảm giác trong sáng ấy nảy nở trong lòng tôi như mấy cành hoa tươi mỉm cười giữa bầu trời quang đãng.',
        paragraphs: [
          'Hằng năm cứ vào cuối thu, lá ngoài đường rụng nhiều và trên không có những đám mây bàng bạc, lòng tôi lại nao nức những kỷ niệm mơn man của buổi tựu trường.',
          'Tôi quên thế nào được những cảm giác trong sáng ấy nảy nở trong lòng tôi như mấy cành hoa tươi mỉm cười giữa bầu trời quang đãng.',
        ],
        chunks: [
          'Hằng năm cứ vào cuối thu,',
          'lá ngoài đường rụng nhiều',
          'và trên không',
          'có những đám mây bàng bạc,',
          'lòng tôi lại nao nức',
          'những kỷ niệm mơn man',
          'của buổi tựu trường.',
          'Tôi quên thế nào được',
          'những cảm giác trong sáng ấy',
          'nảy nở trong lòng tôi',
          'như mấy cành hoa tươi',
          'mỉm cười giữa bầu trời quang đãng.',
        ],
        guideNotes: 'Nhịp câu văn êm đềm; từ "nao nức" (n), "quang đãng" (dấu ngã), "bàng bạc" vần ang.',
        emoji: '🏫',
      },
    ],
  },

  // ==========================================
  // THCS: LỚP 9
  // ==========================================
  {
    id: 'book_lop_9',
    title: 'Ngữ Văn 9 - Kết Nối Tri Thức',
    publisher: 'NXB Giáo Dục Việt Nam',
    grade: 'Lớp 9 - Tập 1 & 2',
    gradeLevel: 9,
    coverBg: 'from-amber-600 via-stone-700 to-slate-800',
    coverIcon: '🌕',
    description: 'Ôn luyện chuẩn mực văn bản nghị luận, truyện ngắn kháng chiến và thi ca chuẩn bị cho kỳ thi vào 10.',
    sections: [
      {
        id: 'sec_l9_1',
        sectionNumber: 'Văn bản 1',
        title: 'Làng (Trích đoạn)',
        authorOrSource: 'Kim Lân',
        fullText: 'Ông Hai ở nơi tản cư nhưng lúc nào cũng tha thiết nhớ về làng Chợ Dầu. Nghe tin làng theo giặc, cổ ông nghẹn ắng lại, da mặt tê rân rân. Ông cúi gằm mặt xuống mà đi, lòng đau như cắt.',
        paragraphs: [
          'Ông Hai ở nơi tản cư nhưng lúc nào cũng tha thiết nhớ về làng Chợ Dầu.',
          'Nghe tin làng theo giặc, cổ ông nghẹn ắng lại, da mặt tê rân rân.',
          'Ông cúi gằm mặt xuống mà đi, lòng đau như cắt.',
        ],
        chunks: [
          'Ông Hai ở nơi tản cư',
          'nhưng lúc nào cũng tha thiết',
          'nhớ về làng Chợ Dầu.',
          'Nghe tin làng theo giặc,',
          'cổ ông nghẹn ắng lại,',
          'da mặt tê rân rân.',
          'Ông cúi gằm mặt xuống mà đi,',
          'lòng đau như cắt.',
        ],
        guideNotes: 'Viết hoa tên riêng Chợ Dầu, từ láy "tê rân rân", từ cảm xúc "nghẹn ắng".',
        emoji: '🏡',
      },
    ],
  },

  // ==========================================
  // THPT: LỚP 10
  // ==========================================
  {
    id: 'book_lop_10',
    title: 'Ngữ Văn 10 - Chân Trời Sáng Tạo',
    publisher: 'NXB Giáo Dục Việt Nam',
    grade: 'Lớp 10 - Tập 1 & 2',
    gradeLevel: 10,
    coverBg: 'from-blue-700 via-indigo-800 to-slate-900',
    coverIcon: '⚔️',
    description: 'Văn học sử thi, truyền kỳ và áng thiên cổ hùng văn hào khí Đông A của dân tộc.',
    sections: [
      {
        id: 'sec_l10_1',
        sectionNumber: 'Văn bản 1',
        title: 'Bình Ngô đại cáo (Trích đoạn)',
        authorOrSource: 'Nguyễn Trãi',
        fullText: 'Từng nghe: Việc nhân nghĩa cốt ở yên dân, quân điếu phạt trước lo trừ bạo. Như nước Đại Việt ta từ trước, vốn xưng nền văn hiến đã lâu. Núi sông bờ cõi đã chia, phong tục Bắc Nam cũng khác.',
        paragraphs: [
          'Từng nghe: Việc nhân nghĩa cốt ở yên dân, quân điếu phạt trước lo trừ bạo.',
          'Như nước Đại Việt ta từ trước, vốn xưng nền văn hiến đã lâu.',
          'Núi sông bờ cõi đã chia, phong tục Bắc Nam cũng khác.',
        ],
        chunks: [
          'Từng nghe:',
          'Việc nhân nghĩa cốt ở yên dân,',
          'quân điếu phạt trước lo trừ bạo.',
          'Như nước Đại Việt ta từ trước,',
          'vốn xưng nền văn hiến đã lâu.',
          'Núi sông bờ cõi đã chia,',
          'phong tục Bắc Nam cũng khác.',
        ],
        guideNotes: 'Văn chính luận biền ngẫu chuẩn xác; viết hoa Đại Việt, Bắc Nam; chú ý "bờ cõi" dấu ngã.',
        emoji: '📜',
      },
    ],
  },

  // ==========================================
  // THPT: LỚP 11
  // ==========================================
  {
    id: 'book_lop_11',
    title: 'Ngữ Văn 11 - Kết Nối Tri Thức',
    publisher: 'NXB Giáo Dục Việt Nam',
    grade: 'Lớp 11 - Tập 1 & 2',
    gradeLevel: 11,
    coverBg: 'from-fuchsia-700 via-purple-800 to-indigo-950',
    coverIcon: '🍃',
    description: 'Phong trào Thơ mới lãng mạn và truyện ngắn hiện thực phê phán đỉnh cao của nền văn học Việt Nam.',
    sections: [
      {
        id: 'sec_l11_1',
        sectionNumber: 'Văn bản 1',
        title: 'Tràng giang (Trích đoạn)',
        authorOrSource: 'Huy Cận',
        fullText: 'Sóng gợn tràng giang buồn điệp điệp, con thuyền xuôi mái nước song song. Thuyền về nước lại, sầu trăm ngả; củi một cành khô lạc mấy dòng. Bèo dạt về đâu, hàng nối hàng; mênh mông không một chuyến đò ngang.',
        paragraphs: [
          'Sóng gợn tràng giang buồn điệp điệp, con thuyền xuôi mái nước song song.',
          'Thuyền về nước lại, sầu trăm ngả; củi một cành khô lạc mấy dòng.',
          'Bèo dạt về đâu, hàng nối hàng; mênh mông không một chuyến đò ngang.',
        ],
        chunks: [
          'Sóng gợn tràng giang buồn điệp điệp,',
          'con thuyền xuôi mái nước song song.',
          'Thuyền về nước lại, sầu trăm ngả;',
          'củi một cành khô lạc mấy dòng.',
          'Bèo dạt về đâu, hàng nối hàng;',
          'mênh mông',
          'không một chuyến đò ngang.',
        ],
        guideNotes: 'Thơ bảy chữ trang trọng, cổ điển; từ "tràng giang" (tr), "sầu trăm ngả" (ngã hỏi).',
        emoji: '🌊',
      },
    ],
  },

  // ==========================================
  // THPT: LỚP 12
  // ==========================================
  {
    id: 'book_lop_12',
    title: 'Ngữ Văn 12 - Cánh Diều',
    publisher: 'NXB Đại Học Sư Phạm',
    grade: 'Lớp 12 - Tập 1 & 2',
    gradeLevel: 12,
    coverBg: 'from-rose-700 via-red-800 to-amber-900',
    coverIcon: '🎖️',
    description: 'Các tác phẩm văn học sử thi và tuyên ngôn bất hủ của dân tộc phục vụ kỳ thi Tốt nghiệp THPT Quốc gia.',
    sections: [
      {
        id: 'sec_l12_1',
        sectionNumber: 'Văn bản 1',
        title: 'Tuyên ngôn Độc lập (Trích đoạn)',
        authorOrSource: 'Chủ tịch Hồ Chí Minh - Ngày 2/9/1945',
        fullText: 'Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do, độc lập. Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền tự do, độc lập ấy.',
        paragraphs: [
          'Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do, độc lập.',
          'Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền tự do, độc lập ấy.',
        ],
        chunks: [
          'Nước Việt Nam có quyền hưởng tự do',
          'và độc lập,',
          'và sự thật đã thành',
          'một nước tự do, độc lập.',
          'Toàn thể dân tộc Việt Nam',
          'quyết đem tất cả tinh thần',
          'và lực lượng,',
          'tính mạng và của cải',
          'để giữ vững quyền tự do,',
          'độc lập ấy.',
        ],
        guideNotes: 'Câu văn hùng hồn, chuẩn mực ngữ pháp và tinh thần thiêng liêng độc lập dân tộc.',
        emoji: '🇻🇳',
      },
      {
        id: 'sec_l12_2',
        sectionNumber: 'Văn bản 2',
        title: 'Tây Tiến (Trích đoạn)',
        authorOrSource: 'Quang Dũng',
        fullText: 'Sông Mã xa rồi Tây Tiến ơi! Nhớ về rừng núi nhớ chơi vơi. Sài Khao sương lấp đoàn quân mỏi, Mường Lát hoa về trong đêm hơi. Dốc lên khúc khuỷu dốc thăm thẳm, Heo hút cồn mây súng ngửi trời.',
        paragraphs: [
          'Sông Mã xa rồi Tây Tiến ơi! Nhớ về rừng núi nhớ chơi vơi.',
          'Sài Khao sương lấp đoàn quân mỏi, Mường Lát hoa về trong đêm hơi.',
          'Dốc lên khúc khuỷu dốc thăm thẳm, Heo hút cồn mây súng ngửi trời.',
        ],
        chunks: [
          'Sông Mã xa rồi Tây Tiến ơi!',
          'Nhớ về rừng núi nhớ chơi vơi.',
          'Sài Khao sương lấp đoàn quân mỏi,',
          'Mường Lát hoa về trong đêm hơi.',
          'Dốc lên khúc khuỷu dốc thăm thẳm,',
          'Heo hút cồn mây súng ngửi trời.',
        ],
        guideNotes: 'Địa danh miền Tây: Sông Mã, Tây Tiến, Sài Khao, Mường Lát; từ láy "khúc khuỷu", "thăm thẳm".',
        emoji: '🏔️',
      },
    ],
  },
];

const LOCAL_STORAGE_CUSTOM_BOOKS = 'be_vui_hoc_custom_books_shelf_v1';

/**
 * Lấy danh sách sách gồm các sách mẫu mặc định (Lớp 1-12) và các sách do chủ phòng tải lên
 */
export function getStoredBooks(): BookItem[] {
  if (typeof window === 'undefined') return DEFAULT_BOOKSHELF;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_BOOKS);
    if (raw) {
      const customBooks: BookItem[] = JSON.parse(raw);
      if (Array.isArray(customBooks) && customBooks.length > 0) {
        // Đảm bảo mọi sách custom đều có gradeLevel (mặc định nếu thiếu)
        const sanitizedCustom = customBooks.map((b) => {
          if (!b.gradeLevel) {
            const match = b.grade ? String(b.grade).match(/lớp\s*(\d+)/i) : null;
            return {
              ...b,
              gradeLevel: match ? parseInt(match[1], 10) : 1,
            };
          }
          return b;
        });
        return [...sanitizedCustom, ...DEFAULT_BOOKSHELF];
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc custom books:', e);
  }
  return DEFAULT_BOOKSHELF;
}

export function saveCustomBook(newBook: BookItem): BookItem[] {
  if (typeof window === 'undefined') return DEFAULT_BOOKSHELF;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_BOOKS);
    let customBooks: BookItem[] = raw ? JSON.parse(raw) : [];
    const existingIndex = customBooks.findIndex((b) => b.id === newBook.id);
    if (existingIndex >= 0) {
      customBooks[existingIndex] = newBook;
    } else {
      customBooks = [newBook, ...customBooks];
    }
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_BOOKS, JSON.stringify(customBooks));
    return [...customBooks, ...DEFAULT_BOOKSHELF];
  } catch (e) {
    console.error('Lỗi lưu custom book:', e);
    return DEFAULT_BOOKSHELF;
  }
}

export function deleteCustomBook(bookId: string): BookItem[] {
  if (typeof window === 'undefined') return DEFAULT_BOOKSHELF;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_BOOKS);
    let customBooks: BookItem[] = raw ? JSON.parse(raw) : [];
    customBooks = customBooks.filter((b) => b.id !== bookId);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_BOOKS, JSON.stringify(customBooks));
    return [...customBooks, ...DEFAULT_BOOKSHELF];
  } catch {
    return DEFAULT_BOOKSHELF;
  }
}

// ==========================================
// TIẾN ĐỘ BÀI ĐÃ LÀM & ĐIỂM SỐ GẦN NHẤT
// ==========================================
const LOCAL_STORAGE_LESSON_PROGRESS = 'be_vui_hoc_lesson_progress_v2';
const LOCAL_STORAGE_DICTATION_HISTORY = 'be_vui_hoc_dictation_history_v2';
const LOCAL_STORAGE_DRAFT_SESSION = 'be_vui_hoc_dictation_draft_v2';

export interface LessonProgressInfo {
  score: number;
  stars: number;
  accuracy: number;
  lastDate: string;
  completedTimes: number;
}

export function getStoredLessonProgress(): Record<string, LessonProgressInfo> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LESSON_PROGRESS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveLessonProgress(
  sectionId: string,
  score: number,
  stars: number,
  accuracy: number
): void {
  if (typeof window === 'undefined') return;
  try {
    const cur = getStoredLessonProgress();
    const prev = cur[sectionId];
    cur[sectionId] = {
      score,
      stars,
      accuracy,
      lastDate: new Date().toLocaleDateString('vi-VN'),
      completedTimes: (prev?.completedTimes || 0) + 1,
    };
    localStorage.setItem(LOCAL_STORAGE_LESSON_PROGRESS, JSON.stringify(cur));
  } catch (e) {
    console.error('Lỗi lưu tiến độ bài:', e);
  }
}

// ==========================================
// LỊCH SỬ BÀI LÀM CHO PHỤ HUYNH
// ==========================================
export interface DictationHistoryRecord {
  id: string;
  date: string;
  bookTitle: string;
  sectionTitle: string;
  mode: 'practice' | 'test';
  submissionType: 'typing' | 'camera';
  score: number;
  stars: number;
  accuracy: number;
  totalWords: number;
  wrongWordsCount: number;
  mistakes: { wrong: string; correct: string; category: string }[];
}

export function getDictationHistory(): DictationHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DICTATION_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveDictationHistoryRecord(rec: Omit<DictationHistoryRecord, 'id' | 'date'>): void {
  if (typeof window === 'undefined') return;
  try {
    const cur = getDictationHistory();
    const newRecord: DictationHistoryRecord = {
      ...rec,
      id: `hist_${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [newRecord, ...cur].slice(0, 50); // Giữ 50 lượt gần nhất
    localStorage.setItem(LOCAL_STORAGE_DICTATION_HISTORY, JSON.stringify(updated));
  } catch {}
}

// ==========================================
// TỰ ĐỘNG LƯU BÀI VIẾT ĐANG DỞ (DRAFT SESSION)
// ==========================================
export interface DraftDictationSession {
  bookId: string;
  sectionId: string;
  sectionTitle: string;
  paraIndex: number | 'all';
  studentText: string;
  currentChunkIndex: number;
  mode: 'practice' | 'test';
  savedAt: string;
}

export function getDraftDictationSession(): DraftDictationSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DRAFT_SESSION);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveDraftDictationSession(draft: DraftDictationSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_DRAFT_SESSION, JSON.stringify(draft));
  } catch {}
}

export function clearDraftDictationSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_DRAFT_SESSION);
  } catch {}
}

