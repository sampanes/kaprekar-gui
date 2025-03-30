import tkinter as tk
from nikki_utils import kaprekar_step, are_digits_all_the_same, get_start_button_string

KAPREKAR_CONSTANT = 6174

# === Style Constants ===
BG_MAIN         = "#e6e6e6"
BG_SECONDARY    = "#f9f9f9"
FG_MAIN         = "#333333"
BTN_COLOR       = "#dddddd"
HGLT_BKG        = "#bbbbbb"
ERROR_BKG       = "#ffcccc"

FONT_NAME       = "Helvetica"
FONT_SIZE_1     = 48
FONT_SIZE_2     = 20
FONT_SIZE_3     = 16
FONT_SIZE_4     = 14

PAD_SINGLE      = 10
PAD_DBL         = PAD_SINGLE * 2
WIDTH           = 450
HEIGHT          = 775
MAIN_GEOMETRY   = f"{WIDTH}x{HEIGHT}"


def styled_button(master, text, command):
    return tk.Button(
        master,
        text=text,
        font=(FONT_NAME, FONT_SIZE_4),
        bg=BTN_COLOR,
        fg=FG_MAIN,
        relief="flat",
        bd=2,
        padx=10,
        pady=4,
        highlightthickness=1,
        highlightbackground=HGLT_BKG,
        command=command
    )


class DigitSelector(tk.Frame):
    def __init__(self, master, on_change=None, **kwargs):
        super().__init__(master, bg=BG_SECONDARY, **kwargs)
        self.value = 0
        self.on_change = on_change

        self.label = tk.Label(
            self,
            text=str(self.value),
            font=(FONT_NAME, FONT_SIZE_1),
            width=2,
            bg=BG_SECONDARY,
            fg=FG_MAIN
        )
        self.label.pack(pady=PAD_SINGLE)

        btn_frame = tk.Frame(self, bg=BG_SECONDARY)
        btn_frame.pack()

        self.up_btn = styled_button(btn_frame, "▲", self.increment)
        self.up_btn.pack(side="top", fill="x", pady=(0, 2))

        self.down_btn = styled_button(btn_frame, "▼", self.decrement)
        self.down_btn.pack(side="top", fill="x", pady=(0, 5))

    def increment(self):
        self.value = (self.value + 1) % 10
        self.label.config(text=str(self.value))
        if self.on_change:
            self.on_change()

    def decrement(self):
        self.value = (self.value - 1) % 10
        self.label.config(text=str(self.value))
        if self.on_change:
            self.on_change()


class DigitApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Kaprekar Playground")
        self.configure(bg=BG_MAIN)
        self.geometry(MAIN_GEOMETRY)

        self.step_count = 0

        title = tk.Label(
            self,
            text="Start with (almost) any 4-digit number",
            font=(FONT_NAME, FONT_SIZE_3, "bold"),
            bg=BG_MAIN,
            fg=FG_MAIN
        )
        title.pack(pady=PAD_SINGLE)

        digits_frame = tk.Frame(self, bg=BG_MAIN)
        digits_frame.pack(pady=PAD_SINGLE)

        self.digits = []
        for _ in range(4):
            ds = DigitSelector(digits_frame, on_change=self.update_start_button)
            ds.pack(side="left", padx=PAD_SINGLE, pady=(0, 5))
            self.digits.append(ds)


        self.button_frame = tk.Frame(self, bg=BG_MAIN)
        self.button_frame.pack(pady=PAD_SINGLE)

        self.start_btn = styled_button(self.button_frame, "", self.run_kaprekar)
        self.start_btn.pack()

        self.continue_btn = styled_button(self.button_frame, "", self.continue_kaprekar)

        self.output_frame = tk.Frame(self, bg=BG_MAIN)
        self.output_frame.pack(pady=PAD_DBL)

        self.update_start_button()

    def update_start_button(self):
        # current_num = ''.join(str(d.value) for d in self.digits)
        digit_values = [d.value for d in self.digits]
        start_btn_string = get_start_button_string(*digit_values)
        self.start_btn.config(text=start_btn_string)

    def flash_background(self, color=ERROR_BKG, duration=200):
        original = self.cget("bg")
        self.configure(bg=color)
        self.after(duration, lambda: self.configure(bg=original))

    def show_temp_message(self, message, duration=2000):
        msg = tk.Label(self, text=message, font=(FONT_NAME, FONT_SIZE_4), bg=BG_MAIN, fg="red")
        msg.pack()
        self.after(duration, msg.destroy)

    def clear_all_steps(self):
        for widget in self.output_frame.winfo_children():
            widget.destroy()

        self.step_count = 0
        self.last_result = None

        if self.continue_btn.winfo_ismapped():
            self.continue_btn.pack_forget()

        # Reset background in case we celebrated
        self.configure(bg=BG_MAIN)
        self.output_frame.configure(bg=BG_MAIN)

        # Remove celebration label if it exists
        if hasattr(self, "celebration_label"):
            self.celebration_label.destroy()
            del self.celebration_label

    def celebrate_kaprekar_success(self):
        self.configure(bg="#ccffcc")  # Light green
        self.output_frame.configure(bg="#ccffcc")

        self.celebration_label = tk.Label(
            self,
            text="🎉 You reached Kaprekar's Constant! 🎉",
            font=(FONT_NAME, FONT_SIZE_3, "bold"),
            bg="#ccffcc",
            fg="#006600"
        )
        self.celebration_label.pack(pady=PAD_SINGLE)

    def run_kaprekar(self):
        self.clear_all_steps()
        digit_values = [d.value for d in self.digits]

        if are_digits_all_the_same(*digit_values):
            self.flash_background()
            self.show_temp_message("Can't use 4 of the same digit!")
            self.update_start_button()
            return

        number = int(''.join(str(d) for d in digit_values))
        num1, num2, result = kaprekar_step(number)
        self.animate_kaprekar_step((num1, num2, result))
        self.last_result = result
        self.update_continue_button()

    def animate_kaprekar_step(self, step_values):
        self.step_count += 1

        # One row: contains the step label and the animated math
        row = tk.Frame(self.output_frame, bg=BG_MAIN)
        row.pack(pady=5, anchor="w", padx=PAD_SINGLE)

        # Static step number label (left-aligned)
        step_label = tk.Label(
            row,
            text=f"Step {self.step_count}",
            font=(FONT_NAME, FONT_SIZE_4, "bold"),
            bg=BG_MAIN,
            fg=FG_MAIN,
            width=10,  # Fixed width keeps labels aligned
            anchor="w"
        )
        step_label.pack(side="left")

        # Animated part
        container = tk.Frame(row, bg=BG_MAIN)
        container.pack(side="left")

        parts = [str(step_values[0]), "-", str(step_values[1]), "=", str(step_values[2])]

        def add_part(index=0):
            if index < len(parts):
                label = tk.Label(
                    container,
                    text=parts[index],
                    font=(FONT_NAME, FONT_SIZE_2),
                    bg=BG_MAIN,
                    fg=FG_MAIN
                )
                label.pack(side="left", padx=5)
                if index == len(parts)-1 and step_values[2] == KAPREKAR_CONSTANT:
                    self.after(25, self.celebrate_kaprekar_success)
                self.after(400, lambda: add_part(index + 1))

        add_part()

    def update_continue_button(self):
        self.continue_btn.config(text=f"Continue with {self.last_result}")

        if self.last_result == KAPREKAR_CONSTANT:
            self.continue_btn.config(state="disabled")
        else:
            self.continue_btn.config(state="normal")

        if not self.continue_btn.winfo_ismapped():
            self.continue_btn.pack(padx=PAD_SINGLE, pady=(PAD_SINGLE, 0))

    def continue_kaprekar(self):
        num1, num2, result = kaprekar_step(self.last_result)
        self.animate_kaprekar_step((num1, num2, result))
        self.last_result = result
        self.update_continue_button()


if __name__ == "__main__":
    app = DigitApp()
    app.mainloop()
