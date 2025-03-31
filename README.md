# Kaprekar Constant Tools (Python GUI)

This branch contains Python utilities and analysis scripts related to the Kaprekar routine.

## Features

- Full implementation of the Kaprekar step logic
- Generator for all valid 4-digit inputs (excluding identical digits)
- Step counter that computes how many steps it takes to reach 6174
- Percentile analysis of all valid combinations
- Script to export valid entries and step counts for web usage

## How to Use

### Setup

1. Clone the repository.
2. (Optional but recommended) Set up a Python virtual environment:
    ```bash
    python -m venv venv
    venv\Scripts\activate # on Windows. or source venv/bin/activate
    ```

3. Install any required packages (tkinter probably?).

### Running the GUI

```bash
python main_gui.py
```

This will start a popup:
- You can click arrows to change the numbers
- Click start to do step 1 on your number
- Click continue to keep doing steps on your last result

---

This branch is made as a neat visual exercise for my friend so hopefully it is not working right now and only needs edits in the utils file to start working :)
