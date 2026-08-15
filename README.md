# Genetic Algorithm

[TOC]

Abbreviations: GA (Genetic Algorithm)

**This article is a section of Ömer Faruk CAN's 2016 Computer Engineering Graduation Thesis.**

**NOTE:** *The evolution.js library was written based on the information here.*

## Definitions

Genetic algorithms are optimization methods that mimic the evolutionary process in nature.

They are not required to find the best solution for every problem. Their goal, however, is to find the best or a near-best solution. They work according to the principle of survival of the fittest, and this goal of "surviving" can be replaced with the goal of "being fit for the best solution," making them applicable to many problems. We can call this concept "Fitness."

Just as there is no single organism—and thus no single solution—in nature, genetic algorithms also do not have a single solution. The common set of all solutions is called a Population. There is no requirement that bad solutions must be eliminated. Although bad solutions have a higher probability of being eliminated, in many genetic methods they are not completely removed, because they may lead us to a good result later.

In genetic algorithms, each solution is stored in Chromosomes, and each solution variable is called a Gene. Therefore, instead of the word "solution," we will use the word Individual. Anything that owns a chromosome and is a member of the Population is called a Member (Individual). Each member can reproduce and create children. In that case, that member becomes the parent of the children. Therefore, an initial population is required for the first parents. Generally, the initial population is created randomly.

Genetic algorithms are built on three fundamental concepts: Mutation, Crossover, and Selection.

When a member's genes are transferred to its children, mutations may occur. Mutations are errors that happen during gene transfer. On a computer, randomness functions are used to mimic this error as in nature.
Mutation, as in nature, can often be harmful. A harmful trait resulting from mutation will reduce the organism's chance of survival (its fitness). However, sometimes mutations can be beneficial. These beneficial traits will increase the organism's chance of survival and make it superior to others. Therefore, organisms negatively affected by mutation eventually disappear, while those positively affected gain great advantages and reproduce.

Crossover is when two organisms reproduce sexually by transferring their chromosomes into a single chromosome, creating a child different from themselves. The child carries traits from its parents. It is partially similar to its parents. The reason for this is that the chromosomes of the two parents are cut at one or more points, and a chromosome is formed with genes randomly taken from both sides.

Natural selection is when many organisms with a low chance of survival die, and many with a high chance of survival survive. If there is no elitism (the best not dying) in nature, even those with a high chance of survival still have a chance of dying.
On a computer, selection is done randomly with respect to the member's fitness function. Nature's harsh conditions and unpredictability are mimicked with randomness functions.

These algorithms were first proposed in 1975 in John Holland's book "Adaptation in Natural and Artificial Systems" [reference:1]. [reference:2]


### Genetic Technique

1. Create the initial population P(0). (t=0)
2. Evaluate P(t)
3. Check the stopping criterion.
4. Select members of P(t).
5. Modify the selected members of P(t) to create population P(t+1). (t=t+1)
6. Go to step 2.


[Reference:3]

### GA (Genetic Algorithm)

An object that stores information about the genetic algorithm.


| variable | description |
| -------- | -------- |
| defaultParameters{} | Default parameters for every Evolution class |
| charSet[] | List of characters that can be used in a String |
| TYPE{} | ENUM storing gene types: BIT, INT, UNIPOLAR, BIPOLAR, STRING, CHROMOSOME |
| CO_TYPE{} | ENUM storing crossover methods: PARTIALY, MULTIPARTIALY, UNIFORM |
| SELECTION{} | ENUM storing selection methods: ROULETTE, SORN |
| ALGORITHMS{} | ENUM storing algorithms: STANDART, DIEANDBORN |



| parameters{} | description |
| -------- | -------- |
| crossing_over | Whether crossover is active |
| crossing_overRate | Crossover probability (for UNIFORM type CO) |
| mutation_rate | Mutation probability |
| population_size | Population size (recommended 100–300) |
| iteration | How many generations to produce |
| algorithm | Algorithm type. ENUM |
| crossing_overMethod | Crossover algorithm. ENUM. Default: MULTIPARTIALLY |
| selectionMethod | Selection algorithm. ENUM. Default: ROULETTE |


| function | purpose |
| -------- | -------- |
| random() | Function that generates a random number between 0 and 1 |
| randomINT(min,max) | Function that generates an integer in the min–max range |
| chance(rate) | Function that realizes the given rate probability and returns boolean true/false |
| copyGene(oldGene) | Function that copies a gene exactly and produces a new gene |
| INS(geneArray) | Increases the number of genes in a chromosome by copying any gene |
| RMV(geneArray) | Deletes any gene from the chromosome |
| SWP(geneArray) | Swaps any two genes in the chromosome |
| splitToParts(chromosome) | Expands the chromosome like a tree. Converts the genes at the bottom of the tree suitable for crossover into GeneParts |
| crossingOverable(partsA,partsB) | Filters the GenePart arrays that are suitable for crossover |
| crossingOver(chromA,chromoB,CO_TYPE,PARTNUM_OR_UNIFORMRATE) | Crosses over two chromosomes |
| crossingOverRULED(chromA,chromoB,CO_TYPE,PARTNUM_OR_UNIFORMRATE) | Crosses over two chromosomes and repairs errors in the resulting chromosomes (since the same process is also done after mutation, the crossingOver function is preferred) |


### Evolution

The top-level class that contains populations.


| variable | description |
| -------- | -------- |
| populations[] | Populations |
| parameters{} | Evolutionary parameters |
| fitnessFunction(member) | Fitness function |
| createPopulation(population_size) | Function to create a random initial population |


| function | purpose |
| -------- | -------- |
| setParameters(param) | Changes the parameters |
| start() | Runs the evolutionary algorithm |



### Population

An array of Members. The Population's fitness function and the best and worst Members are determined and ranked here.


| variable | description |
| -------- | -------- |
| members[] | Members of the Population |
| evolution | Parent Evolution class |
| bestMember | Member with the highest fitness value |
| avgFitness | Average fitness value |
| minFitness | Minimum fitness value |
| maxFitness | Maximum fitness value |
| totalFitness | Total fitness value |
| lastMemberId | Stores the ID of the last member |


| function | purpose |
| -------- | -------- |
| calcFitness() | Calculates the fitness values of the Population |
| select() | Performs selection (one member) |
| rate() | Determines each member's selection probability |
| selection() | Creates a new generation through selection |
| crossing_over() | All members undergo crossover among themselves |
| mutation() | All members undergo mutation |


### Member

The name given to each member of a Population.
Has a Chromosome.


| variable | description |
| -------- | -------- |
| int generation | Stores which generation the member belongs to |
| num fitness | Member's fitness value |
| num id | Member's ID |
| chromosome | Member's chromosome |
| population | The population the member belongs to |


| function | purpose |
| -------- | -------- |
| kill() | The member is killed |
| generate() | The member reproduces |


### Fitness

A function that determines how well a Member fits its purpose. For example: Surviving and Reproducing.
A high value increases the Member's chance of continuing its lineage.

### Chromosome

An array composed of Genes. However, it is itself a gene type. That is, a chromosome can have sub-chromosomes. This way, we can more easily express the solution genetically.

### Gene

Each unit that determines the structure of a Member.


| Gene Type | description |
| -------- | -------- |
| bit | 0 → 1 [0 or 1] |
| int | Integer between min and max |
| unipolar | 0 → 1 &nbsp;&nbsp; 0.3→0.5 [value between 0 and 1] |
| bipolar | -1 → 1 &nbsp;&nbsp; -0.3→0.5 [value between -1 and 1] |
| string | "abc" → "adef" |
| chromosome | Gene array composed of other genes |


| variable | description |
| -------- | -------- |
| val | The value of the gene according to its type |
| type | The type of the gene |
| chg | Stores whether CHANGE-type mutation is enabled |
| ins | Stores whether INSERT-type mutation is enabled |
| rmv | Stores whether REMOVE-type mutation is enabled |
| swp | Stores whether SWAP-type mutation is enabled |
| mutation_rate | Probability of the gene undergoing mutation |
| chg_rate | Probability of each STRING character undergoing CHANGE-type mutation [used only for String] |
| ins_rate | Probability of the gene undergoing INSERT-type mutation |
| rmv_rate | Probability of the gene undergoing REMOVE-type mutation |
| swp_rate | Probability of the gene undergoing SWAP-type mutation |
| min | Minimum allowed value for INT-type genes |
| max | Maximum allowed value for INT-type genes |


| function | purpose |
| -------- | -------- |
| mutate() | Undergoes mutation |


### Initial Population

The first randomly created population, depending on the population size.

### Fitness Function

A function that produces a value determining how fit a member is. A fit population member tends to continue its lineage more. A high value returned by this function increases the organism's chance of continuing its lineage.

### Crossover

Producing new individuals similar to their ancestors by merging the genes of two Chromosomes.

* **[PARTIALLY] Partially Crossing Over:** A point is selected among the genes. They are split at that point and the parts are swapped.

* **[MULTIPARTIALLY] Multi-Partially Crossing Over:** The gene is split at multiple points, and the parts are swapped.

* **[UNIFORM] Uniform Crossing Over:** Each gene is swapped with the other gene with a certain probability.

* **Arithmetic Crossing Over:** Exchange performed with AND, OR, XOR. X AND Y = 0 AND 1 = 0 (This method will not be used in the project)

### Mutation

Each gene is replaced with a value it can take, or increased/decreased by that amount.

* **[CHG] CHANGING:** The gene's value changes.

* **[INS] INSERTION:** A gene is added to the chromosome.

* **[RMV] REMOVING:** A gene is removed from the chromosome.

* **[SWP] SWAPING:** Two genes swap places.

### Selection

* **[ROULETTE] Roulette selection:** Fitness values of all members are written to a table, then each fitness value is divided by the total fitness value to determine probabilities.

* **[SORT] Rank selection:** In roulette selection, if there is a member with a very high fitness, the selection probability of others becomes nearly impossible. This is a problem in the long run. Therefore, selection is based not on fitness value but on rank after sorting. That is, the fitness value becomes between 1 and (Number of Members).

* **Steady-state selection:** According to this, large parts of the chromosomes should be carried to the next generation for parent selection. A few chromosomes are selected to create new offspring. (Usually those with the highest fitness are selected.)

* **Elitism:** The best member(s) are copied unchanged to the next generation. (Cannot be used in real-time algorithms.)

### Real-Time Operation

If the evolutionary process is real-time, the death and reproduction of members are taken into account.
The evolutionary algorithm does not run step by step, but asynchronously. That is, a 1st-generation member and a 3rd-generation member can coexist in the same population.

## Technical Requirements

* **Genetic Representation of the Problem:** Each solution must be transferable to genes

* **Evaluation:** A function that evaluates the fitness of each solution; Fitness function

* **Initial population creation method:** Methods for determining the initial population. For example: Creating random genes.

* **Genetic composition methods:** Techniques that will form the chromosomes of the next population. For example: Mutation and Crossover


## Simple Algorithm

1. Generate a random initial population
2. Evaluate the population
3. If maximum generation is reached; go to step 8
4. Perform selection
5. Perform crossover
6. Mutate
7. Go to step 2
8. Stop

![alt tag](https://upload.wikimedia.org/wikipedia/tr/5/59/GAelen.jpg)

## "Reincarnation" Real-Time Algorithm

1. Generate a random initial population
2. Wait for a member to die → go to step 3, and wait for termination → go to step 10
3. Evaluate the population
4. Perform selection for 2 members
5. Cross over the 2 members and create a new member
6. Mutate the new member
7. Remove the dead member from the population
8. Add the new member to the population
9. Go to step 2
10. Stop
