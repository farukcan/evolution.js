# Genetik Algoritma

[TOC]

Kısaltmalar : GA (Genetik Algoritma)

**Bu makale, Ömer Faruk CAN'ın 2016 yılına ait Bilgisayar Mühendisliği Bitirme Tezine ait bir bölümdür **

**NOT**:*Buradaki bilgilerden yararlanılarak evolution.js kütüphanesi yazıldı.*

## Tanımlar
Genetik algoritmalar doğadaki evrimsel süreci taklit eden optimizasyon yöntemleridir. 

Her problemde en iyi çözümü bulması zorunlu değildir. Fakat amacı en iyi veya en iyiye yakın çözümü bulmaktır. En iyilerin hayatta kalması şartına göre çalışır ve bu "hayatta kalmak" amacı, "en iyi çözüme uygun olmak" amacıyla değiştirelerek birçok probleme uygulanabilir. Bu kavrama "Fitness" veya "Uygunluk" diyebiliriz.

Yine doğada nasıl tek canlı yani tek çözüm yoksa, genetik algoritmalarda da tek çözüm yoktur. Tüm çözümlerin ortak kümesine Popülasyon denilir. Kötü çözümlerin yok olma zorunluluğu yoktur. Kötü çözümlerin ne kadar yok olma ihtimali yüksek olsada, bir çok genetik yöntemde,kötü çözümler bizi ilerde iyi bir sonuca götürebileceği için tamamen yok edilmezler.

Genetik algoritmalarda her bir çözüm Kromozomlarda tutulur ve her bir çözüm değişkenine Gen denir. Onun için "çözüm" kelimesi yerine Birey kelimesini kullanacağız.Her kromozom sahibi olan ve Popülasyonun üyesi olan şeye 'Birey(Member)' denilir. Her birey üreyip, çocuklar oluşturabilir. Bu durumda o birey, çocukların ebeveyni olur. Dolayısıyla ilk ebeveynler için bir başlangıç populasyonu olması gerekir. Genelde başlangıç populasyonu rastgele oluşturulur.

Genetik algoritmalar 3 temel kavram üzerine kuruludur ;  Mutasyon, Çaprazlama ve Seçilim.

Bir bireyin genleri çocuklarına aktarılırken, mutasyonlar oluşabilir. Mutasyonlar, gen aktarımda oluşan hatalardır. Bilgisayarda, bu hatayı doğadaki gibi taklit etmek için rastgelelik fonksiyonları kullanılır.
Mutasyon, doğadaki gibi çoğu sefer zararlı olabilir. Mutasyon sonucu olşan zararlı özellik o canlının hayatta kalma ihtimalini (uygunluğunu) düşürecektir. Fakat bazı zamanlar, mutasyonlar canlıya  faydalı olabilir. Bu faydalı özellikler canlının hayatta kalma ihtimali arttıracak ve diğerlerine karşı o canlıyı üstün kılacaktır. Onun için mutasyondan kötü etkilenen canlı zamanla yok olur, iyi etkilenen ise büyük avantajlar sağlayarak, kendini çoğaltır.

Çaprazlama, 2 canlının eşeyli üreyerek kendi kromozomlarını tek bir kromozoma naklederek, kendilerinde farklı bir çocuk oluşturmasıdır. Çocuk, ebeveynlerinin özelliklerini taşır. Ebeveynlerini kısmen benzer. Bunun sebebi, iki ebeveynin kromozomlarının bir veya birkaç noktadan kesilerek, iki taraftan rastgele alınan genler ile bir kromozom oluşturulmasıdır.

Doğal seçilim, hayatta kalma ihtimali az olan canlıların birçoğunun ölüp, hayatta kalma ihtimali yüksek olanlarının bir çoğunun hayatta kalmasıdır. Eğer doğada bir elitizim(en iyinin ölmemesi) durumu yoksa, hayatta kalma ihtimali yüksek olanınında yine ölme ihtimali vardır.
Bilgisayarda seçilim, bireyin uygunluk fonksiyonu gözetilerek rastgele yapılır. Doğanın zor koşulları ve ön görülemezliği, rastgelelik fonksiyonları ile taklit edilir.

Bu algoritmalar ilk kez  1975 yılında John Holland'ın “Adaptation in Natural and Artificial Systems”[kaynakça:1] kitabında ortaya atılmıştır. [kaynakça:2]


### Genetik Teknik

1. P(0) başlangıç populasyonunu oluştur. (t=0)
2. P(t)'yi değerlendir
3. Durdurma kriterini kontrol et.
4. P(t)'nin bireylerini seç.
5. P(t)'nin seçilmiş bireylerini değiştirerek P(t+1) populasyonunu oluştur. (t=t+1)
6. Adım 2'ye geç.


[Kaynakça;3]

### GA (Genetik Algoritma)
Genetik algoritma hakkında bilgilerin saklandığı objedir.

|	değişken	|	açıklama				|
|	--------	|	--------				|
| defaultParameters{} | Her Evolution sınıfın varsayılan parametreleridir |
|	charSet[]	|	Bir String'de kullanılabilecek karakterlerin listesidir	|
|	TYPE{}	|	Gen türlerin saklandığı ENUM BIT,INT,UNIPOLAR,BIPOLAR,STRING,CHROMOSOME	|
|	CO_TYPE{}	|	Çaprazlama yönteminin saklandığı ENUM PARTIALY,MULTIPARTIALY,UNIFORM	|
|	SELECTION{}	|	Seçilim yönteminin saklandığı ENUM ROULETTE,SORN	|
|	ALGORITHMS{}	|	Algoritmaların saklandığı ENUM STANDART,DIEANDBORN	|



|	parameters{}	|	açıklama				|
|	--------	|	--------				|
|	crossing_over	|	Çaprazlamanın aktif olma durumu		|
|	crossing_overRate	|	çaprazlama ihtimali(UNIFORM türü CO için)		|
|	mutation_rate	|	mutasyon ihtimali		|
|	population_size	|	populasyon büyüklüğü (önerilen 100-300)	|
|	iteration	|	Kaç jenerasyon üretileceği	|
|	algorithm	|	Algoritmanın türüdür. ENUM	|
|	crossing_overMethod	|	Çaprazlama Algoritması. ENUM : Varsayılan: MULTIPARTIALLY |
|	selectionMethod	|	Seçilim Algoritması. ENUM : Varsayılan: ROULETTE |


|	fonksiyon	|	amaç		|
|	--------	|	--------	|
|	random()	|	0-1 arası rastgele sayı üreten fonksiyondur.	|
|	randomINT(min,max)	|	min,max aralığında tam sayı üreten fonksiyondur	|
|	chance(rate)	|	rate ihtimalini gerçekleyen ve buna göre boolean:true/false döndüren fonksiyon	|
|	copyGene(oldGene)	|	Bir genin aynen kopyalayıp,yeni gen üreten fonksiyondur	|
|	INS(geneArray)	|	Kromozomdaki gen sayısını, herhangi bir geni kopyalayarak arttırır	|
|	RMV(geneArray)	|	Kromozomdaki herhangi bir geni siler	|
|	SWP(geneArray)	|	Kromozomdaki herhangi iki geni yer değiştirir	|
|	splitToParts(chromosome)	|	Kromozomu ağaç gibi açar. Çaprazlama için uygun ağacın en altındaki genleri, GenePart'a çevirir.	|
|	crossingOverable(partsA,partsB)	|	İki Gen Parçası(GenePart) dizisininin, çaprazlama için uygun olanlarını ayıklar.	|
|	crossingOver(chromA,chromoB,CO_TYPE,PARTNUM_OR_UNIFORMRATE)	|	İki kromozomu çaprazlar.	|
|	crossingOverRULED(chromA,chromoB,CO_TYPE,PARTNUM_OR_UNIFORMRATE)	|	İki kromozomu çaprazlar ve çaprazlama sonucu oluşan kromozomlardaki hataları onarır.(mutasyon sonrasıda aynı işlem yapıldığı için crossingOver fonksiyonu tercih edilir)	|


### Evolution (Evrim)
Altında populasyonları bulunduran. En üst sınıftır.


|	değişken	|	açıklama				|
|	--------	|	--------				|
|	populations[]	|	Populasyonlar			|
|	parameters{}	|	Evrimsel parametreler	|
|	fitnessFunction(member)	|	fitness fonksiyonu	|
|	createPopulation(population_size)	|	Rastgele başlangıç populasyonu oluşturma fonksiyonu	|


|	fonksiyon	|	amaç		|
|	--------	|	--------	|
|	setParameters(param)	|	Parametreleri değiştirir	|
|	start()	|	Evrimsel Algoritmayı çalıştırır	|



### Population (Populasyon)
Member'ların dizisidir. Population'un fitness fonksiyonu ve Memberların en iyi ve kötüsü burada belirlenip, sıralanır.


|	değişken	|	açıklama				|
|	--------	|	--------				|
|	members[]	|	Population'un üyelerinin	|
|	evolution	|	Evolution üst sınıfı	|
|	bestMember	|	En yüksek fitness değerine sahip üyedir	|
|	avgFitness	|	Ortalama fitness değeri	|
|	minFitness	|	Minimum fitness değeri	|
|	maxFitness	|	Maximum fitness değeri	|
|	totalFitness	|	Toplam fitness değeri	|
|	lastMemberId	|	Son bireyin Id'si saklanır	|


|	fonksiyon	|	amaç		|
|	--------	|	--------	|
|	calcFitness()	|	Populasyonun fitness değerlerini hesaplar	|
|	select()	|	Seçilim Yapar (bir adet)	|
|	rate()	|	Her üyenin seçilim ihtimalini belirler	|
|	selection()	|	Seçilim yapılarak yeni jenerasyon oluşturulur	|
|	crossing_over()	|	Bütün bireyler kendi aralarında çaprazlamaya uğratılır	|
|	mutation()	|	Bütün bireyler mutasyona uğratılır	|


### Member (Birey)
Population'un her bir üyesine verilen addır
Chromosome'a sahiptir


|	değişken	|	açıklama				|
|	--------	|	--------				|
|	int generation	|	Bireyin kaçıncı nesil olduğunu saklar	|
|	num fitness	|	Bireyin fitness değeri	|
|	num id	|	Bireyin Idsi	|
|	chromosome	|	Bireyin kromozomu	|
|	population	|	Bireyin bağlı olduğu populasyon	|


|	fonksiyon	|	amaç		|
|	--------	|	--------	|
|	kill()	|	Üye öldürülür	|
|	generate()	|	Üye ürer		|


### Fitness (Uygunluk)
Bir Memberin amacına ne kadar uygun olduğunu belirleyen fonksiyondur. Mesele : Hayatta kalmak ve Üreyebilmek
Yüksek olması Memberin, soyunun devam edebilme ihtimalini arttırır.

### Chromosome (Kromozom)
Gene'lerden oluşan bir dizidir.Ancak kendisi bir gen türüdür. Yani bir kromozomun, alt kromozomları olabilir. Bu sayede, daha kolay bir şekilde çözümü genetik olarak ifade edebiliyoruz.

### Gene (Gen)
Member'in yapısı belirleyen her bir birime denir.


|	Gen Türü	|	açıklama			|
|	--------	|	--------			|
|	bit			|	0 -> 1	[0 veya 1]									|
|	int			|	min-max arası tam sayıdır							|
|	unipolar	|	0 -> 1		0.3->0.5 [0 ile 1 arası değer]			|
|	bipolar		|	-1 -> 1		-0.3->0.5 [-1 ile 1 arası değer]		|
|	string		|	"abc"	->	"adef"									|
|	chromesome	|	başka genlerden oluşan, gen dizisi					|


|	değişken	|	açıklama			|
|	--------	|	--------			|
|	val	|	Genin Türüne göre aldığı değerdir.	|
|	type	|	Genin Türüdür.	|
|	chg	|	CHANGE türü mutasyon geçirebilme özelliğinin açık olmasını saklanır.	|
|	ins	|	INSERT türü mutasyon geçirebilme özelliğinin açık olmasını saklanır.	|
|	rmv	|	REMOVE türü mutasyon geçirebilme özelliğinin açık olmasını saklanır.	|
|	swp	|	SWAP türü mutasyon geçirebilme özelliğinin açık olmasını saklanır.	|
|	mutation_rate	|	Genin mutasyon geçirme ihmalidir.	|
|	chg_rate	|	STRING her karakterinin CHANGE türü mutasyon geçirme ihmalidir. [sadece Stringde kullanılır]	|
|	ins_rate	|	Genin INSERT türü mutasyon geçirme ihmalidir.	|
|	rmv_rate	|	Genin REMOVE türü mutasyon geçirme ihmalidir.	|
|	swp_rate	|	Genin SWAP türü mutasyon geçirme ihmalidir.	|
|	min	|	INT tipi genler için minimum alınabilecek değer saklanır	|
|	max	|	INT tipi genler için maximum alınabilecek değer saklanır	|


|	fonksiyon	|	amaç		|
|	--------	|	--------	|
|	mutate()	|	mutasyona uğrar	|


### Başlangıç Populasyonu

Populasyon büyüklüğüne bağlı olarak ilk oluşan rastgele populasyondur.

### Fitness Fonksiyonu (Uygunluk Fonksiyonu)
Bireyin ne kadar uygun olduğunu belirleyen değeri üreten fonksiyondur. Uygun populasyon üyesi daha fazla soyunu devam ettirmeye meyillidir. Bu fonksiyonun döndürdüğü değerin yüksek olması canlının, soyunu devam ettirme ihtimalini arttırır.

### Çaprazlama
2 Kromozomun genlerini kaynaştırılması ile yeni atalarına benzer bireyler üretmektir.

* **[PARTIALLY] Partially Crossing Over:** Genlerden bir nokta seçilir. O Noktadan bölünürek parçalar değiştirilir.

* **[MULTIPARTIALLY] Multi-Partially Crossing Over:** Gen çok noktadan parçalanarak, parçalar yer değiştirir.

* **[UNIFORM] Uniform Crossing Over: :** Her gen,belli bir olasılıkta diğer genle yer değiştirir.

* **Aritmetic Crossing Over** : AND,OR,XOR ile yapılan takastır. X AND Y = 0 AND 1 = 0 (Bu yöntem projede kullanılmayacaktır)

### Mutasyon
Her gen, alabileceği bir değer ile değiştirilir veya o miktarda arttırılıp,azaltılır.

* **[CHG] CHANGING**(DEĞİŞTİRME) : Genin değeri değişir.

* **[INS] INSERTION**(EKLEME) : Kromozoma Gen eklenir

* **[RMV] REMOVING** (ÇIKARMA): Kromozamdan gen çıkartılır.

* **[SWP] SWAPING** (YER DEĞİŞTİRME) : İki genin yerleri değişir.

### Seçilim

* **[ROULETTE] Rulet seçimi** : Tüm bireylerin uygunluk değerleri bir tabloya yazılır, sonra bu uygunluk değeri toplam uygunluk değerine bölünerek, olasılıklar belirlenir.

* **[SORT] Sıralama seçilimi** : Rulet seçiminde, eğer çok yüksek uygunluğa sahip birey varsa , diğerlerinin seçilim ihtimali imkansızlaşmaktadır. Bu da ileri vadede bir sorundur. Onun için uygunluk değerine göre değilde, sıralama yapılarak kaçıncı sırada olduğuna göre bir seçilim yapılır. Yani uygunluk değeri 1 ile (Birey Sayısı) arasında olur.

* **Sabit durum seçimi** : Buna göre, ebeveyn seçimi için kromozomların büyük parçaları bir sonraki nesile taşınmalıdır. Yeni döl oluşturulma üzere birkaç kromozom seçilir.(Genellikle en yüksek uygunluğa sahip olanlar seçilir.)

* **Elitizm**(Seçkinlik) : En iyi birey(ler) bozulmadan bir sonraki jenerasyona kopyalanır. (Gerçek zamanlı algoritmalarda kullanılamaz.)

### Gerçek Zamanlılık
Eğer evrimsel süreç gerçek zamanlıysa, bireyin ölmesi ve üremesi durumları göz önüne alınır.
Evrimsel algoritma, adım adım olarak değil, asenkron şekilde çalışır. Yani 1.nesil birey ile 3.nesil birey aynı populasyonda bulunabilir.

## Teknik Gereksinimler

* **Probleminin Genetik Temsili** : Her bir çözümün genlere aktarılabilmesi

* **Değerlendirme** : Her bir çözümün uygunluğunu değerlendiren bir fonksiyon ; Fitness/Uygunluk fonksiyonu

* **Başlangıç populasyonu oluşturma yöntemi ** : Başlangıç populasyonun belirlenmesinde yöntemler. Örneğin : Rastgele genler oluşturma.

* **Genetik kompozisyon yöntemleri** : Bir sonraki populasyonun kromozomları oluşturacak teknikler. Örneğin : Mutasyon ve Çaprazlama


## Basit Algoritma

1. Rastgele başlangıç populasyonu üret
2. Populasyonu değerlendir
3. Maximum nesile ulaşıldıysa ; Adım 8'e git
4. Seçilim yap
5. Çaprazlama yap
6. Mutasyona uğrat
7. Adım 2'ye git
8. Dur

![alt tag](https://upload.wikimedia.org/wikipedia/tr/5/59/GAelen.jpg)

## "Reenkarnasyon " Gerçek Zamanlı Algoritması
1. Rastgele başlangıç populasyonu üret
2. Bir üyenin ölmesini bekle => 3.Adıma geç, ve Sonlanmayı bekle => 10.adıma geç
3. Populasyonu değerlendir
4. 2 birey için seçilim yap
5. 2 bireyi çaprazlamaya uğrat ve yeni birey oluştur.
6. Yeni bireyi mutasyona uğrat.
7. Ölen bireyi, populasyondan sil.
8. Yeni bireyi populasyona ekle.
9. 2.adıma geç
10. Dur