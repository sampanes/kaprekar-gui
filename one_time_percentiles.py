from collections import defaultdict

def pad4(n):
    return str(n).zfill(4)

def is_valid(n):
    s = pad4(n)
    return len(set(s)) > 1

def kaprekar_step(n):
    s = pad4(n)
    digits = sorted(s)
    low = int("".join(digits))
    high = int("".join(digits[::-1]))
    return high - low

def steps_to_6174(n):
    count = 0
    while n != 6174:
        n = kaprekar_step(n)
        count += 1
    return count

def generate_kaprekar_stats():
    step_counts = defaultdict(int)
    total_valids = 0
    return_set = set()
    for n in range(0,10000):
        if is_valid(n):
            total_valids+=1
            steps = steps_to_6174(n)
            step_counts[steps] += 1
            if steps == 7:
                # print(f"number {n:4} takes full 7 steps")
                return_set.add(n)

    total = sum(step_counts.values())
    sorted_steps = sorted(step_counts.items())

    print("Step Count Totals:")
    for step, count in sorted_steps:
        print(f"  {step} steps: {count} numbers")

    print("\nStep Count Percentiles:")
    cumulative = 0
    for step, count in sorted_steps[::-1]:
        cumulative += count
        percentile = round(cumulative / total * 100, 1)
        print(f"  {step} steps: {percentile}%")
    
    return_list = list(return_set)
    
    return_list.sort()
    return return_list, total_valids

def how_many_combos(digits):
    raw = pow(10, digits)
    my_set = set()
    for ii in range(raw):
        if is_valid(ii):
            num_str = pad4(ii)
            canonical = "".join(sorted(num_str))
            my_set.add(canonical)
    return my_set

if __name__ == "__main__":
    c=how_many_combos(digits=4)
    print(f"hypothetically there are only {len(c)} unique paths, but we want every possible start a user can put in randomly")
    takes_all_seven, valids = generate_kaprekar_stats()
    print(f"\nWe have concluded that {len(takes_all_seven)} combos take all seven steps"\
          f"\nOut of {valids} valid user entries (10,000 minus the ten \"all repeats\" entries)")
    with open("valids.txt", "w") as f:
        for item in takes_all_seven:
            f.write(f"{item}\n")
