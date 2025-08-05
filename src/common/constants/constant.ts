export const testAccount = ["4@gmail.com"]
export const idQuestionTestBeforeGenAI = 894
// id các bài test tạo bằng AI và đã được check, có thể cho người dùng xem
export const idsQuestionTestGenAiAvailable = [1184, 1183, 1182, 1181, 1180, 1179, 1178, 1177, 1176, 1175, 1174, 1173, 1172, 1171, 1170, 1169, 1168, 1167, 1166, 1165, 1164, 1163, 1162, 1161, 1160, 1159, 1158, 1157, 1156, 1155, 1154, 1153, 1152, 1151, 1150, 1149, 1148, 1147, 1146, 1145, 1224,
    1223, 1222, 1221, 1220, 1219, 1218, 1217, 1216, 1215, 1214, 1213, 1212, 1211, 1210, 1209, 1208, 1207, 1206, 1205, 1204, 1203, 1202, 1201, 1200, 1199, 1198, 1197, 1196, 1195, 1194, 1193, 1192, 1191, 1190, 1189, 1188, 1187, 1186, 1185
]
export const TYPE_SKILL_MAP = {
    0: "Listening",
    1: "Reading",
    2: "Writing",
}
export const HSK_PDF_VERSION = 7

export const KIND_DEFAULT = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
}

export const KIND_HSKK_FREE = {
    1: [],
    2: [],
    3: ["HSKKSC1", "HSKKSC2"],
    4: ["HSKKTC1", "HSKKTC2"],
    5: ["HSKKTC1", "HSKKTC2"],
    6: ["HSKKCC1", "HSKKCC2"]
}

export const KIND_LISTENING_FREE = {
    1: ["110001", "110002"],
    2: ["210001", "210002"],
    3: ["310001", "310002"],
    4: ["410001"],
    5: ["510001"],
    6: ["610001"]
}

export const KIND_READING_FREE = {
    1: ["120001", "120002"],
    2: ["220001", "220002"],
    3: ["320001", "320002"],
    4: ["420001"],
    5: ["520001"],
    6: ["620001"]
}

export const KIND_LISTENING_PREMIUM = {
    1: ["110003", "110004"],
    2: ["210003", "210004"],
    3: ["310003", "310004"],
    4: ["410002", "410003_1", "410003_2"],
    5: ["510002_1", "510002_2"],
    6: ["610002", "610003"]
};

export const KIND_READING_PREMIUM = {
    1: ["120003", "120004"],
    2: ["220003", "220004"],
    3: ["320003"],
    4: ["420002", "420003_1", "420003_2"],
    5: ["520002", "520003"],
    6: ["620002", "620003", "620004"]
};

export const KIND_WRITING_PREMIUM = {
    1: [],
    2: [],
    3: ["330001", "330002"],
    4: ["430001", "430002"],
    5: ["530001", "530002", "530003"],
    6: ["630001"]
};

export const KIND_MIA_PREMIUM = {
    1: [],
    2: [],
    3: [],
    4: ["430002"],
    5: ["530002", "530003"],
    6: ["630001"]
};

export const KIND_MAPPING = {
    "110001": "Đúng hay Sai",
    "210001": "Đúng hay Sai",
    "410001": "Đúng hay Sai",
    "120001": "Đúng hay Sai",
    "220003": "Đúng hay Sai",
    "310002": "Đúng hay Sai",
    "110002": "Chọn ảnh phù hợp",
    "110003": "Ghép ảnh với audio",
    "210002": "Ghép ảnh với audio",
    "310001": "Ghép ảnh với audio",
    "110004": "Hội thoại ngắn",
    "210003": "Hội thoại ngắn",
    "310003": "Hội thoại ngắn",
    "210004": "Hội thoại trung",
    "310004": "Hội thoại trung",
    "120002": "Ghép ảnh với câu",
    "220001": "Ghép ảnh với câu",
    "320001": "Hỏi và trả lời",
    "120003": "Hỏi và trả lời",
    "220004": "Hỏi và trả lời",
    "320002": "Điền từ vào chỗ trống",
    "120004": "Điền từ vào chỗ trống",
    "220002": "Điền từ vào chỗ trống",
    "420001": "Điền từ vào chỗ trống",
    "520001": "Điền từ vào chỗ trống",
    "320003": "Đoạn văn ngắn",
    "420003_1": "Đoạn văn ngắn",
    "420003_2": "Đoạn văn ngắn",
    "520002": "Đoạn văn ngắn",
    "330001": "Ghép từ thành câu",
    "430001": "Ghép từ thành câu",
    "530001": "Ghép từ thành câu",
    "410002": "Nghe hiểu trung",
    "410003_1": "Nghe hiểu dài",
    "410003_2": "Nghe hiểu dài",
    "430002": "Đặt câu",
    "510001": "Nghe hiểu ngắn",
    "510002_1": "Nghe hiểu trung - dài",
    "510002_2": "Nghe hiểu trung - dài",
    "330002": "Điền vào chỗ trống",
    "520003": "Đoạn văn dài",
    "620004": "Đoạn văn dài",
    "530002": "Viết đoạn văn theo từ vựng",
    "530003": "Viết đoạn văn theo tranh",
    "610001": "Hội thoại",
    "610002": "Phỏng vấn",
    "610003": "Hội thoại/Đoạn văn dài",
    "620001": "Chọn câu sai",
    "620002": "Điền vào chỗ trống 1",
    "620003": "Điền vào chỗ trống 2",
    "420002": "Sắp xếp câu theo thứ tự",
    "630001": "Tóm tắt đoạn văn",
    "HSKKSC1": "Lắng nghe và lặp lại",
    "HSKKSC2": "Lắng nghe và trả lời",
    "HSKKSC3": "Trả lời câu hỏi",
    "HSKKTC1": "Lắng nghe và lặp lại",
    "HSKKTC2": "Miêu tả bức tranh",
    "HSKKTC3": "Trả lời câu hỏi",
    "HSKKCC1": "Lắng nghe và lặp lại câu bạn vừa nghe",
    "HSKKCC2": "Đọc đoạn văn",
    "HSKKCC3": "Trả lời câu hỏi",
}