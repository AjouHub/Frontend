export const departmentNameMap: { [key: string]: string } = {
    /* 공과대학 */
    'department.me': '기계공학과',
    'department.env': '환경안전공학과',
    'department.academic': '산업공학과',
    'department.ce': '건설시스템공학과',
    'department.che': '화학공학과',
    'department.tse': '교통시스템공학과',
    'department.mse': '첨단신소재공학과',
    'department.arch': '건축학과',
    'department.chembio': '응용화학생명공학과',
    'department.ise': '융합시스템공학과',
    'department.appchem': '응용화학과',

    /* 첨단ICT융합대학 */
    'department.ece': '전자공학과',
    'department.aisemi': '지능형반도체공학과',
    'department.mobility': '미래모빌리티공학과',

    /* 소프트웨어융합대학 */
    'department.media': '디지털미디어학과',
    'department.software': '소프트웨어학과',
    'department.ndc': '국방디지털융합학과',
    'department.security': '사이버보안학과',
    'department.aai': '인공지능융합학과',

    /* 자연과학대학 */
    'department.math': '수학과',
    'department.chem': '화학과',
    'department.physics': '물리학과',
    'department.biology': '생명과학과',
    'department.frontiers': '프런티어과학과',

    /* 경영대학 */
    'department.abiz': '경영학과',
    'department.fe': '금융공학과',
    'department.ebiz': '경영인텔리전스학과',
    'department.gb': '글로벌경영학과',

    /* 인문대학 */
    'department.kor': '국어국문학과',
    'department.history': '사학과',
    'department.english': '영어영문학과',
    'department.culture': '문화콘텐츠학과',
    'department.france': '불어불문학과',

    /* 사회과학대학 */
    'department.econ': '경제학과',
    'department.soci': '사회학과',
    'department.pba': '행정학과',
    'department.pol': '정치외교학과',
    'department.apsy': '심리학과',
    'department.slez': '스포츠레저학과',
    'department.eps': '경제정치사회융합학부',

    /* 의·간·약대 */
    'department.medicine': '의학과',
    'department.nursing': '간호학과',
    'department.pharm': '약학과',

    /* 첨단바이오융합대학 */
    'department.ibio': '첨단바이오융합대학',

    /* 다산학부대학 */
    'department.uc': '다산학부대학',
    'department.pre': '자유전공학부',

    /* 국제학부 */
    'department.isa': '국제학부'
};


export const departmentGroups: { [college: string]: string[] } = {
    '공과대학': [
        'department.me','department.env','department.academic','department.ce','department.che',
        'department.tse','department.mse','department.arch','department.chembio','department.ise','department.appchem'
    ],
    '첨단ICT융합대학': ['department.ece','department.aisemi','department.mobility'],
    '소프트웨어융합대학': ['department.media','department.software','department.ndc','department.security','department.aai'],
    '자연과학대학': ['department.math','department.chem','department.physics','department.biology','department.frontiers'],
    '경영대학': ['department.abiz','department.fe','department.ebiz','department.gb'],
    '인문대학': ['department.kor','department.history','department.english','department.culture','department.france'],
    '사회과학대학': ['department.econ','department.soci','department.pba','department.pol','department.apsy','department.slez','department.eps'],
    '의과대학': ['department.medicine'],
    '간호대학': ['department.nursing'],
    '약학대학': ['department.pharm'],
    '첨단바이오융합대학': ['department.ibio'],
    '다산학부대학': ['department.uc','department.pre'],
    '국제학부': ['department.isa'],
};