import random
def kaprekar_step(n: int):
    '''
    We get an INPUT PARAMETER
    called n
    it is an int
    that's all that n: int means
    int is a keyword, cannot (should not) ever be a variable name

    then we return three numbers in parenthesis, this is technically a tuple
    a tuple is like a list but carved in stone. an immutable list. a hashable list. worry not about this witchcraft yet
    '''
    return (random.randint(1,9999),random.randint(1,9999),random.randint(1,9999))

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
