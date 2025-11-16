class Calculator:
    def to_number(value):
        """
        Convert strings like '$50', '₹1,200', '50 USD' into float.
        """
        if isinstance(value, (int, float)):
            return float(value)

        if isinstance(value, str):
            cleaned = (
                value.replace("$", "")
                    .replace("₹", "")
                    .replace(",", "")
                    .strip()
            )

        # extract only the first valid number in case of units like "50 USD"
        import re
        match = re.search(r"[-+]?\d*\.?\d+", cleaned)
        if not match:
            raise ValueError(f"Invalid number: {value}")

        return float(match.group())

        raise ValueError(f"Unsupported type: {type(value)}")

    @staticmethod
    def multiply(a, b):
        """
        Multiply two integers.

        Args:
            a (int): The first integer.
            b (int): The second integer.

        Returns:
            int: The product of a and b.
        """
        try:
            a = to_number(a)
            b = to_number(b)
            return a * b
        except Exception as e:
            raise ValueError(f"Invalid values for multiply: a={a}, b={b} | Error: {e}")

    @staticmethod
    def calculate_total(*x: float) -> float:
        """
        Calculate sum of the given list of numbers

        Args:
            x (list): List of floating numbers

        Returns:
            float: The sum of numbers in the list x
        """
        return sum(x)
    
    @staticmethod
    def calculate_daily_budget(total: float, days: int) -> float:
        """
        Calculate daily budget

        Args:
            total (float): Total cost.
            days (int): Total number of days

        Returns:
            float: Expense for a single day
        """
        return total / days if days > 0 else 0