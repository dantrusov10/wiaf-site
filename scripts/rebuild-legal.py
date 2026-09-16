# -*- coding: utf-8 -*-
from pathlib import Path
import json
import re

text = Path("src/content/legal/prod-rules-raw.md").read_text(encoding="utf-8")
parts = text.split("\n## ")
interaction_raw = parts[0]
reg_raw = parts[1] if len(parts) > 1 else ""
pd_raw = parts[2] if len(parts) > 2 else ""
idx = pd_raw.find("1. Общие положения 1.1. Настоящая Политика")
if idx < 0:
    idx = pd_raw.find("Настоящая Политика разработана")
pd_terms_raw = pd_raw[:idx] if idx > 0 else pd_raw
policy_raw = pd_raw[idx:] if idx > 0 else ""

TERM_KEYS = [
    "ЭЛЕКТРОННАЯ ТЕНДЕРНАЯ ПЛОЩАДКА wIaF",
    "АВТОРИЗАЦИЯ",
    "ЗАКРЫТАЯ ЧАСТЬ ЭТП",
    "ЗАЯВИТЕЛЬ",
    "КАРТОЧКА ТОРГОВ",
    "ЛИЦЕВОЙ СЧЕТ ПОЛЬЗОВАТЕЛЯ ЭТП",
    "ОПЕРАТОР",
    "ОРГАНИЗАТОР ТОРГОВ",
    "ОТКРЫТАЯ ЧАСТЬ ЭТП",
    "ПОЛЬЗОВАТЕЛЬ ЭТП",
    "УЧАСТНИК",
    "ПРОГРАММНО-АППАРАТНЫЕ СРЕДСТВА ЭТП",
    "РЕГИСТРАЦИЯ",
    "СРЕДСТВА ГАРАНТИЙНОГО ОБЕСПЕЧЕНИЯ ОПЛАТЫ ОКАЗАНИЯ УСЛУГ ОПЕРАТОРА",
    "СТАВКА, ПРЕДЛОЖЕНИЕ О ЦЕНЕ",
    "ТОРГИ, ТОРГОВАЯ ПРОЦЕДУРА",
    "ЭЛЕКТРОННЫЙ ДОКУМЕНТ",
    "ЭЛЕКТРОННЫЙ ОБРАЗ ДОКУМЕНТА",
    "ЭЛЕКТРОННАЯ ПОДПИСЬ",
    "ЭДО",
]

SECTION_TITLES = [
    "1. Общие положения",
    "2. Порядок регистрации",
    "3. Открытие и ведение Лицевых счетов Пользователя ЭТП",
    "4. Проведение торгов",
    "5. Оплата услуг Оператора",
    "6. Требования к конечному оборудованию Пользователей",
    "7. Ответственность сторон и разрешение споров",
]


def clean(s: str) -> str:
    return " ".join(s.replace("\r", "").split()).strip()


def filt(arr):
    out = []
    for p in arr:
        t = p.strip()
        if not t:
            continue
        if re.fullmatch(r"[\d.\s]+", t):
            continue
        if len(t) < 3:
            continue
        out.append(t)
    return out


def split_terms_block(block: str):
    out = []
    positions = []
    for key in TERM_KEYS:
        p = block.find(key)
        if p >= 0:
            positions.append((p, key))
    positions.sort()
    if not positions:
        t = clean(block)
        if t:
            out.append(t)
        return out
    pre = clean(block[: positions[0][0]])
    if pre:
        out.append(pre)
    for i, (pos, _key) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(block)
        chunk = clean(block[pos:end])
        m = re.search(r"\s1\.\s+Общие положения", chunk)
        if m:
            chunk = clean(chunk[: m.start()])
        if chunk:
            out.append(chunk)
    return out


def split_numbered(s: str):
    s = s.replace("\r", "")
    # Ensure space after clause numbers before Cyrillic/Latin caps (not dates like 27.07.2006)
    s = re.sub(r"(\d+(?:\.\d+){1,3}\.?)(?=[А-ЯA-ZЁ«\"])", r"\1 ", s)
    # Split only on clause-like numbers followed by a capital letter (not "года", not lowercase)
    pieces = re.split(
        r"(?=(?:(?<=\s)|(?<=^))\d+(?:\.\d+){1,3}\.?\s+[А-ЯA-ZЁ«\"])",
        s,
    )
    out = []
    for p in pieces:
        t = clean(p)
        if not t:
            continue
        if re.fullmatch(r"\d+\.?", t):
            continue
        if len(t) < 12 and re.fullmatch(r"[\d.\s]+", t):
            continue
        # glue orphan date fragments back if previous exists
        if out and re.match(r"^\d{1,2}\.\d{1,2}\.\d{4}", t):
            out[-1] = clean(out[-1] + " " + t)
            continue
        out.append(t)
    return out


def format_reglament(raw: str):
    title = "## Регламент электронной тендерной площадки wIaF"
    out = [title]
    m = re.search(r"\(УТВЕРЖДЕН[^\)]+\)", raw)
    if m:
        out.append(m.group(0))

    ti = raw.find("#### Термины")
    sec1 = raw.find("1. Общие положения")
    if ti >= 0 and sec1 > ti:
        out.append("#### Термины и определения")
        terms_block = raw[ti:sec1]
        terms_block = re.sub(r"^####\s*Термины и определения\s*", "", terms_block)
        out.extend(split_terms_block(terms_block))
        rest = raw[sec1:]
    else:
        rest = raw[sec1:] if sec1 >= 0 else raw

    positions = []
    for title_s in SECTION_TITLES:
        p = rest.find(title_s)
        if p >= 0:
            positions.append((p, title_s))
    positions.sort()

    if not positions:
        out.extend(split_numbered(rest))
        return out

    for i, (pos, title_s) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(rest)
        section = rest[pos:end]
        out.append("## " + title_s)
        content = section[len(title_s) :]
        clauses = split_numbered(content)
        for c in clauses:
            if re.match(r"^\d+(\.\d+)*\.?\s+\S.{0,80}$", c) and not c.rstrip().endswith((".", ";", ":")):
                out.append("### " + c)
            elif re.match(r"^\d+(\.\d+)*\.?\s+\S.{0,60}:$", c):
                out.append("### " + c.rstrip(":"))
            else:
                out.append(c)
    return out


def format_pd_blob(raw: str, title: str):
    out = ["## " + title]
    m = re.search(r"\(УТВЕРЖДЕН[^\)]+\)", raw)
    if m:
        out.append(m.group(0))
        raw = raw[m.end() :]
    raw = re.sub(r"^Условия обработки персональной информации[^\n]*\n?", "", raw.strip())
    clauses = split_numbered(raw)
    for c in clauses:
        if re.match(r"^\d+(\.\d+)*\.?\s+\S.{0,90}$", c) and not c.rstrip().endswith((".", ";")):
            out.append("### " + c)
        else:
            out.append(c)
    return out


interaction = []
for line in interaction_raw.split("\n"):
    t = clean(line)
    if not t:
        continue
    if t.startswith("Правила взаимодействия |"):
        continue
    interaction.append(t)

reglament = format_reglament(reg_raw)
pd_terms = format_pd_blob(pd_terms_raw, "Условия обработки персональной информации")
pd_policy = format_pd_blob(policy_raw, "Политика ООО «ВИАФ» по обработке и защите персональных данных")

data = {
    "interaction": filt(interaction),
    "reglament": filt(reglament),
    "pdTerms": filt(pd_terms),
    "pdPolicy": filt(pd_policy),
}

Path("src/content/legal/sections.json").write_text(
    json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
)
print({k: len(v) for k, v in data.items()})
print("--- reglament sample ---")
for i, p in enumerate(data["reglament"][:30]):
    print(i, p[:110])
