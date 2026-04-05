import requests
from bs4 import BeautifulSoup


def get_data(url):
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.content, "html.parser")
    table = soup.find("table")
    if not table:
        raise ValueError("No table found.")

    rows = table.find_all("tr")
    data = []

    for row in rows[1:]:
        cells = row.find_all("td")
        if len(cells) >= 3:
            try:
                x = int(cells[0].get_text(strip=True))
                char = cells[1].get_text(strip=True)
                y = int(cells[2].get_text(strip=True))
                data.append((x, y, char))
            except ValueError:
                continue

    if not data:
        raise ValueError("No valid coordinate data found.")

    return data


def build_grid(data):
    max_x = max(x for x, y, char in data)
    max_y = max(y for x, y, char in data)

    grid = [[" " for _ in range(max_x + 1)] for _ in range(max_y + 1)]

    for x, y, char in data:
        grid[y][x] = char

    return grid


def print_grid(grid, reverse_y=True, mapping=None, title=None):
    if title:
        print(f"\n=== {title} ===")

    row_range = range(len(grid) - 1, -1, -1) if reverse_y else range(len(grid))

    for r in row_range:
        row = grid[r]
        if mapping:
            line = "".join(mapping.get(ch, ch) for ch in row)
        else:
            line = "".join(row)
        print(line)


url = "https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub"

data = get_data(url)
grid = build_grid(data)

# Raw output
print_grid(grid, reverse_y=True, title="RAW (reversed Y)")
print_grid(grid, reverse_y=False, title="RAW (normal Y)")

# Try visual remaps
print_grid(
    grid,
    reverse_y=True,
    mapping={"\u2588": "#", "\u2591": " "},
    title="block = #, light = space (reversed Y)"
)

print_grid(
    grid,
    reverse_y=True,
    mapping={"\u2588": " ", "\u2591": "#"},
    title="block = space, light = # (reversed Y)"
)

print_grid(
    grid,
    reverse_y=False,
    mapping={"\u2588": "#", "\u2591": " "},
    title="block = #, light = space (normal Y)"
)

print_grid(
    grid,
    reverse_y=False,
    mapping={"\u2588": " ", "\u2591": "#"},
    title="block = space, light = # (normal Y)"
)
