from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        console_messages = []
        page.on("console", lambda msg: console_messages.append(msg.text))

        page.goto("http://localhost:9002")
        page.screenshot(path="jules-scratch/verification/verification.png")

        with open("console.log", "w") as f:
            for msg in console_messages:
                f.write(msg + "\n")

        browser.close()

run()