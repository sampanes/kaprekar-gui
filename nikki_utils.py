def kaprekar_step(n: int):
    '''
    We get an INPUT PARAMETER
    called n
    it is an int
    that's all that n: int means
    int is a keyword, cannot (should not) ever be a variable name, but n is a fine var name. just a bit undescriptive

    then we return three numbers in parenthesis, this is technically a tuple
    a tuple is like a list but carved in stone. an immutable list. a hashable list. worry not about this witchcraft yet

    how to do this?
    well, for starters you want to "reorder" the number two ways
    the smallest way (where the digits are small to large order)
    the largest way (where the digits are large to small order)
    so 6257 becomes
    2567
    and
    7652
    Use my functions to get these new numbers
    smallest_ordered_int(some_integer)
    largest_ordered_int(some_integer)
    
    we want to return largest, smallest, and difference (so subtract, largest - smallest)
    '''
    l=largest_ordered_int(n)
    s=smallest_ordered_int(n)
    d=l-s
    return (l,s,d)

def are_digits_all_the_same(a, b, c, d):
    '''
    We get four numbers
    we gotta check if they are all the same
    we can use as many lines as we need
    I can imagine a case where we use like 12 to 16 lines
    and there's a way to make it one line
    this is not an exercize in being pythonic and finding the coolest way
    just getting it to work is the goal!
    '''
    return a==b==c==d

def get_start_button_string(a, b, c, d):
    '''
    Here we have four digits and we want to return one string
    the string should have words then all four digits like this:

    "Start with ####"
    '''
    return f"Start with {a}{b}{c}{d}"

# BELOW THIS IS JUST WAYS TO TEST ABOVE STUFF
# and also my helper funcs lol
def smallest_ordered_int(n: int):
    '''Has to be four digits'''
    l=list(str(n))
    l.sort()
    while len(l)<4:
        l.insert(0,'0')
    return int(''.join(l))

def largest_ordered_int(n: int):
    '''Has to be four digits'''
    l=list(str(n))
    l.sort(reverse=True)
    while len(l)<4:
        l.append('0')
    return int(''.join(l))

if __name__ == "__main__":
    l,s,d=kaprekar_step(3427)
    if l==7432 and s==2347 and d==(l-s):
        print("PASS:\tKaprekar Passed!")
    else:
        print("Try again, Kaprekar Failed")
    if are_digits_all_the_same(1,2,1,1):
        print("Try again, these digits are not the same so we should return false")
    else:
        print("PASS:\tare digits all the same pass! when they are not the same")
    if are_digits_all_the_same(4,4,4,4):
        print("PASS:\tare digits all the same pass! when they're the same")
    else:
        print("Try again, these digits are all the same so we should return true")
    if get_start_button_string(2,4,6,8)=="Start with 2468":
        print("PASS:\tget start button string returns good string!")
    else:
        print("try again, we want to return the right button string")
    