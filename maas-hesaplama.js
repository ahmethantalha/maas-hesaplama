function maasHesapla() {
    // HTML'den değerleri al
    const hesaplamaTuru = document.getElementById("hesaplama-turu").value;
    const ucret = parseFloat(document.getElementById("ucret").value);
    const donemBaslangic = parseInt(document.getElementById("donem-baslangic").value);
    const donemBitis = parseInt(document.getElementById("donem-bitis").value);
    const calismaGunu = parseFloat(document.getElementById("calisma-gunu").value);
    const asgariUcretli = document.getElementById("asgari-ucretli").checked;
    const sigortaDurumu = document.getElementById("sigorta-durumu").value;
    const issizlikSigortasi = document.getElementById("issizlik-sigortasi").checked;
  
    // Teşvik Bilgilerini Al
    const tesvikliMi = sigortaDurumu === "tesvikli";
    const tesvikTuru = tesvikliMi ? document.getElementById("tesvik-turu").value : "";
    const belgeNo = tesvikliMi ? document.getElementById("belge-no").value : "";
  
    // 25.12.2024 tarihli ve 2024/91 numaralı vergi sirkülerine göre 2025 yılı asgari ücret bilgileri
    const asgariUcretBrut = 26005.50;
    const asgariUcretNet = 22104.67;
  
    // 2025 yılı gelir vergisi dilimleri (Sirkülerde belirtilmediği için 2024 ile aynı kabul edelim, değişirse güncellenmesi gerekecek)
    const vergiDilimleri2025 = [
        { sinir: 158000, oran: 0.15 },
        { sinir: 330000, oran: 0.20 },
        { sinir: 1200000, oran: 0.27 },
        { sinir: 4300000, oran: 0.35 },
        { sinir: Infinity, oran: 0.40 }
    ];
  
    // Hesaplama fonksiyonları
    function gelirVergisiHesapla(matrah, kumulatifMatrah) {
        let gelirVergisi = 0;
        let kalanMatrah = matrah;
  
        for (let i = 0; i < vergiDilimleri2025.length; i++) {
            const dilim = vergiDilimleri2025[i];
            const oncekiDilimSiniri = i > 0 ? vergiDilimleri2025[i - 1].sinir : 0;
  
            if (kumulatifMatrah >= dilim.sinir) {
                continue;
            }
  
            const dilimMatrah = Math.min(kalanMatrah, dilim.sinir - kumulatifMatrah);
            gelirVergisi += dilimMatrah * dilim.oran;
            kalanMatrah -= dilimMatrah;
            kumulatifMatrah += dilimMatrah;
  
            if (kalanMatrah <= 0) {
                break;
            }
        }
  
        return gelirVergisi;
    }
  
    function bruttenNetHesapla(brutMaas, calismaGunu, kumulatifGelirVergisiMatrahi = 0) {
      let brutt;
      let netMaas;
      let gelirVergisiMatrahi;
      let gelirVergisi;
      let asgariUcretGelirVergisiIstisnaTutari;
      let asgariUcretDamgaVergisiIstisnaTutari;
  
      if (asgariUcretli) {
          brutt = asgariUcretBrut;
          netMaas = asgariUcretNet;
          gelirVergisiMatrahi = 0;
          gelirVergisi = 0;
          asgariUcretGelirVergisiIstisnaTutari = 0;
          asgariUcretDamgaVergisiIstisnaTutari = 0;
      } else {
          brutt = brutMaas;
          const gunlukBrut = brutt / 30;
          const aylikBrut = gunlukBrut * calismaGunu;
  
          const sgkIsciPayiOrani = sigortaDurumu === "emekli" ? 0.075 : (issizlikSigortasi ? 0.15 : 0.14);
          const sgkIsciPayi = aylikBrut * sgkIsciPayiOrani;
  
          const issizlikSigortasiIsciPayi = issizlikSigortasi && sigortaDurumu !== "emekli" ? aylikBrut * 0.01 : 0;
  
          gelirVergisiMatrahi = aylikBrut - sgkIsciPayi - issizlikSigortasiIsciPayi;
          gelirVergisi = gelirVergisiHesapla(gelirVergisiMatrahi, kumulatifGelirVergisiMatrahi);
  
          const damgaVergisi = aylikBrut * 0.00759;
  
          // Asgari ücret istisna tutarlarını hesapla (aylık brüt üzerinden)
          asgariUcretGelirVergisiIstisnaTutari = Math.min(gelirVergisi, gelirVergisiHesapla(asgariUcretBrut - (asgariUcretBrut * sgkIsciPayiOrani) - (issizlikSigortasi && sigortaDurumu !== "emekli" ? asgariUcretBrut * 0.01 : 0) , 0));
          asgariUcretDamgaVergisiIstisnaTutari = Math.min(damgaVergisi, asgariUcretBrut * 0.00759);
  
          gelirVergisi = Math.max(0, gelirVergisi - asgariUcretGelirVergisiIstisnaTutari);
          damgaVergisi = Math.max(0, damgaVergisi - asgariUcretDamgaVergisiIstisnaTutari);
  
          const kesintilerToplami = sgkIsciPayi + issizlikSigortasiIsciPayi + gelirVergisi + damgaVergisi;
  
          netMaas = aylikBrut - kesintilerToplami;
      }
  
      // İşverene Maliyet Hesaplama (5 puanlık indirimli hali)
      const sgkIsverenPayiOrani = tesvikliMi ? 0 : (sigortaDurumu === "emekli" ? 0.225 : 0.1575); // 5 Puanlık indirim
      const sgkIsverenPayi = brutt * sgkIsverenPayiOrani;
      const issizlikSigortasiIsverenPayi = issizlikSigortasi && sigortaDurumu !== "emekli" ? brutt * 0.02 : 0;
      const isvereneMaliyet = brutt + sgkIsverenPayi + issizlikSigortasiIsverenPayi;
  
      return {
          brut: brutt,
          net: netMaas,
          sgkIsciPayi: sigortaDurumu === "emekli" || asgariUcretli ? 0 : brutt * (sigortaDurumu === "emekli" ? 0.075 : (issizlikSigortasi ? 0.15 : 0.14)),
          issizlikSigortasiIsciPayi: (issizlikSigortasi && sigortaDurumu !== "emekli" && !asgariUcretli) ? brutt * 0.01 : 0,
          issizlikSigortasiIsverenPayi: (issizlikSigortasi && sigortaDurumu !== "emekli" && !asgariUcretli) ? brutt * 0.02 : 0,
          gelirVergisi: gelirVergisi,
          damgaVergisi: damgaVergisi,
          isvereneMaliyet: isvereneMaliyet,
          gelirVergisiMatrahi: gelirVergisiMatrahi,
          kumulatifGelirVergisiMatrahi: kumulatifGelirVergisiMatrahi + gelirVergisiMatrahi,
          asgariUcretGelirVergisiIstisnaTutari: asgariUcretGelirVergisiIstisnaTutari,
          asgariUcretDamgaVergisiIstisnaTutari: asgariUcretDamgaVergisiIstisnaTutari
      };
  }
  
    function nettenBrutHesapla(netMaas, calismaGunu, kumulatifGelirVergisiMatrahi = 0) {
        // Netten brüte hesaplama, iteratif bir yaklaşım gerektirir.
        let tahminBrut = asgariUcretli ? asgariUcretBrut : netMaas;
        let oncekiTahmin;
        const iterasyonSiniri = 100;
        let iterasyon = 0;
        let net;
        let gelirVergisiMatrahi;
  
        do {
            oncekiTahmin = tahminBrut;
            const hesaplamaSonucu = bruttenNetHesapla(tahminBrut, calismaGunu, kumulatifGelirVergisiMatrahi);
            net = hesaplamaSonucu.net;
            gelirVergisiMatrahi = hesaplamaSonucu.gelirVergisiMatrahi;
            if (!asgariUcretli) {
              if (net < netMaas) {
                  tahminBrut += (netMaas - net);
              } else {
                  tahminBrut -= (net - netMaas);
              }
            }
            iterasyon++;
        } while (Math.abs(net - netMaas) > 0.01 && iterasyon < iterasyonSiniri && !asgariUcretli);
  
        // Son hesaplamayı tekrar yapıp tüm değerleri döndür
        const sonuc = bruttenNetHesapla(tahminBrut, calismaGunu, kumulatifGelirVergisiMatrahi);
        return {
            brut: sonuc.brut,
            net: sonuc.net,
            sgkIsciPayi: sonuc.sgkIsciPayi,
            issizlikSigortasiIsciPayi: sonuc.issizlikSigortasiIsciPayi,
            issizlikSigortasiIsverenPayi: sonuc.issizlikSigortasiIsverenPayi,
            gelirVergisi: sonuc.gelirVergisi,
            damgaVergisi: sonuc.damgaVergisi,
            isvereneMaliyet: sonuc.maliyet,
            gelirVergisiMatrahi: gelirVergisiMatrahi,
            kumulatifGelirVergisiMatrahi: sonuc.kumulatifGelirVergisiMatrahi,
            asgariUcretGelirVergisiIstisnaTutari: sonuc.asgariUcretGelirVergisiIstisnaTutari,
            asgariUcretDamgaVergisiIstisnaTutari: sonuc.asgariUcretDamgaVergisiIstisnaTutari
        };
    }
  
    function maliyettenNetHesapla(maliyet, calismaGunu, kumulatifGelirVergisiMatrahi = 0) {
        // İşverene maliyetten net maaşı bulmak için de iteratif bir yaklaşım kullanıyoruz.
        let tahminBrut = asgariUcretli ? asgariUcretBrut : maliyet / (1 + (sigortaDurumu === "emekli" ? 0.225 : 0.1575) + (issizlikSigortasi && sigortaDurumu !== "emekli" ? 0.02 : 0)); // 5 Puanlık indirim
        let oncekiTahmin;
        const iterasyonSiniri = 100;
        let iterasyon = 0;
        let hesaplananMaliyet;
        let gelirVergisiMatrahi;
        let net;
  
        do {
            oncekiTahmin = tahminBrut;
            const hesaplamaSonucu = bruttenNetHesapla(tahminBrut, calismaGunu, kumulatifGelirVergisiMatrahi);
            hesaplananMaliyet = hesaplamaSonucu.maliyet;
            gelirVergisiMatrahi = hesaplamaSonucu.gelirVergisiMatrahi;
            net = hesaplamaSonucu.net;
  
            if (!asgariUcretli) {
              if (hesaplananMaliyet < maliyet) {
                tahminBrut += (maliyet - hesaplananMaliyet);
              } else {
                tahminBrut -= (hesaplananMaliyet - maliyet);
              }
            }
            iterasyon++;
        } while (Math.abs(hesaplananMaliyet - maliyet) > 0.01 && iterasyon < iterasyonSiniri && !asgariUcretli);
  
        // Son hesaplamayı tekrar yapıp tüm değerleri döndür
        const sonuc = bruttenNetHesapla(tahminBrut, calismaGunu, kumulatifGelirVergisiMatrahi);
        return {
            brut: sonuc.brut,
            net: sonuc.net,
            sgkIsciPayi: sonuc.sgkIsciPayi,
            issizlikSigortasiIsciPayi: sonuc.issizlikSigortasiIsciPayi,
            issizlikSigortasiIsverenPayi: sonuc.issizlikSigortasiIsverenPayi,
            gelirVergisi: sonuc.gelirVergisi,
            damgaVergisi: sonuc.damgaVergisi,
            isvereneMaliyet: sonuc.maliyet,
            gelirVergisiMatrahi: gelirVergisiMatrahi,
            kumulatifGelirVergisiMatrahi: sonuc.kumulatifGelirVergisiMatrahi,
            asgariUcretGelirVergisiIstisnaTutari: sonuc.asgariUcretGelirVergisiIstisnaTutari,
            asgariUcretDamgaVergisiIstisnaTutari: sonuc.asgariUcretDamgaVergisiIstisnaTutari
        };
    }
  
    function maliyettenBrutHesapla(maliyet, calismaGunu, kumulatifGelirVergisiMatrahi = 0) {
        // İşverene maliyetten brüt maaşı bulmak için de iteratif bir yaklaşım kullanıyoruz.
        let tahminBrut = maliyet / (1 + (sigortaDurumu === "emekli" ? 0.225 : 0.1575) + (issizlikSigortasi && sigortaDurumu !== "emekli" ? 0.02 : 0)); // 5 Puanlık indirim
        let oncekiTahmin;
        const iterasyonSiniri = 100;
        let iterasyon = 0;
        let hesaplananMaliyet;
        let gelirVergisiMatrahi;
  
        do {
            oncekiTahmin = tahminBrut;
            const hesaplamaSonucu = bruttenNetHesapla(tahminBrut, calismaGunu, kumulatifGelirVergisiMatrahi);
            hesaplananMaliyet = hesaplamaSonucu.maliyet;
            gelirVergisiMatrahi = hesaplamaSonucu.gelirVergisiMatrahi;
  
            if (hesaplananMaliyet < maliyet) {
                tahminBrut += (maliyet - hesaplananMaliyet);
            } else {
                tahminBrut -= (hesaplananMaliyet - maliyet);
            }
  
            iterasyon++;
        } while (Math.abs(hesaplananMaliyet - maliyet) > 0.01 && iterasyon < iterasyonSiniri);
  
        return {
            brut: tahminBrut,
            net: null, // Bu senaryoda net maaş doğrudan hesaplanmıyor
            kesinti: null, // Bu senaryoda kesinti doğrudan hesaplanmıyor
            maliyet: maliyet,
            gelirVergisiMatrahi: gelirVergisiMatrahi,
            kumulatifGelirVergisiMatrahi: kumulatifGelirVergisiMatrahi
        };

        // Aylık Sonuçları Hesapla ve Tabloyu Doldur
    const aylikSonuclar = [];
    let kumulatifGelirVergisiMatrahi = 0;
    const donemFarki = donemBitis - donemBaslangic + 1;
    for (let ay = donemBaslangic; ay <= donemBitis; ay++) {
        let sonuc;
        if (hesaplamaTuru === "brutten-nete") {
            sonuc = bruttenNetHesapla(ucret, calismaGunu, kumulatifGelirVergisiMatrahi);
        } else if (hesaplamaTuru === "netten-brute") {
            if(asgariUcretli){
                sonuc = nettenBrutHesapla(asgariUcretNet, calismaGunu, kumulatifGelirVergisiMatrahi);
            } else {
                sonuc = nettenBrutHesapla(ucret, calismaGunu, kumulatifGelirVergisiMatrahi);
            }
        } else if (hesaplamaTuru === "maliyetten-nete") {
            if(asgariUcretli){
                sonuc = bruttenNetHesapla(asgariUcretBrut, calismaGunu, kumulatifGelirVergisiMatrahi);
            } else {
                sonuc = maliyettenNetHesapla(ucret, calismaGunu, kumulatifGelirVergisiMatrahi);
            }
        } else if (hesaplamaTuru === "maliyetten-brute") {
            sonuc = maliyettenBrutHesapla(ucret, calismaGunu, kumulatifGelirVergisiMatrahi);
        }

        aylikSonuclar.push({
            ay: ay,
            brut: sonuc.brut,
            net: sonuc.net,
            sgkIsciPayi: sonuc.sgkIsciPayi,
            issizlikSigortasiIsciPayi: sonuc.issizlikSigortasiIsciPayi,
            issizlikSigortasiIsverenPayi: sonuc.issizlikSigortasiIsverenPayi,
            gelirVergisi: sonuc.gelirVergisi,
            damgaVergisi: sonuc.damgaVergisi,
            isvereneMaliyet: sonuc.maliyet,
            gelirVergisiMatrahi: sonuc.gelirVergisiMatrahi,
            kumulatifGelirVergisiMatrahi: sonuc.kumulatifGelirVergisiMatrahi,
            asgariUcretGelirVergisiIstisnaTutari: sonuc.asgariUcretGelirVergisiIstisnaTutari,
            asgariUcretDamgaVergisiIstisnaTutari: sonuc.asgariUcretDamgaVergisiIstisnaTutari
        });

        kumulatifGelirVergisiMatrahi = sonuc.kumulatifGelirVergisiMatrahi;
    }
}


    // Sonuçları Göster
    const aylar = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const tablo = document.getElementById("aylik-sonuclar").getElementsByTagName("tbody")[0];
    const toplamSatir = document.getElementById("toplam-satir");
    tablo.innerHTML = "";

    let toplamBrut = 0;
    let toplamNet = 0;
    let toplamSGKIsveren = 0;
    let toplamSGKIs = 0;
    let toplamIssizlikIsveren = 0;
    let toplamIssizlikIs = 0;
    let toplamGelirVergisi = 0;
    let toplamDamgaVergisi = 0;
    let toplamMaliyet = 0;
    let toplamGelirVergisiMatrahi = 0;
    let toplamKumulatifGelirVergisiMatrahi = 0;
    let toplamAsgariUcretGelirVergisiIstisnaTutari = 0;
    let toplamAsgariUcretDamgaVergisiIstisnaTutari = 0;

    for (let i = 0; i < aylikSonuclar.length; i++) {
        const satir = tablo.insertRow();
        const ayHucre = satir.insertCell();
        const brutHucre = satir.insertCell();
        const sgkIsciHucre = satir.insertCell();
        const issizlikIsciHucre = satir.insertCell();
        const issizlikIsverenHucre = satir.insertCell();
        const kgvmHucre = satir.insertCell();
        const gvMatrahHucre = satir.insertCell();
        const asgariUcretGVHucre = satir.insertCell();
        const gelirVergisiHucre = satir.insertCell();
        const asgariUcretDVHucre = satir.insertCell();
        const damgaVergisiHucre = satir.insertCell();
        const netHucre = satir.insertCell();
        const maliyetHucre = satir.insertCell();

        ayHucre.textContent = aylar[aylikSonuclar[i].ay];
        brutHucre.textContent = aylikSonuclar[i].brut.toFixed(2) + " TL";
        sgkIsciHucre.textContent = aylikSonuclar[i].sgkIsciPayi.toFixed(2) + " TL";
        issizlikIsciHucre.textContent = aylikSonuclar[i].issizlikSigortasiIsciPayi.toFixed(2) + " TL";
        issizlikIsverenHucre.textContent = aylikSonuclar[i].issizlikSigortasiIsverenPayi.toFixed(2) + " TL";
        kgvmHucre.textContent = aylikSonuclar[i].kumulatifGelirVergisiMatrahi.toFixed(2) + " TL";
        gvMatrahHucre.textContent = aylikSonuclar[i].gelirVergisiMatrahi.toFixed(2) + " TL";
        asgariUcretGVHucre.textContent = aylikSonuclar[i].asgariUcretGelirVergisiIstisnaTutari.toFixed(2) + " TL";
        gelirVergisiHucre.textContent = aylikSonuclar[i].gelirVergisi.toFixed(2) + " TL";
        asgariUcretDVHucre.textContent = aylikSonuclar[i].asgariUcretDamgaVergisiIstisnaTutari.toFixed(2) + " TL";
        damgaVergisiHucre.textContent = aylikSonuclar[i].damgaVergisi.toFixed(2) + " TL";
        netHucre.textContent = aylikSonuclar[i].net.toFixed(2) + " TL";
        maliyetHucre.textContent = aylikSonuclar[i].isvereneMaliyet?.toFixed(2) + " TL" || "Hesaplanamadı";

        toplamBrut += aylikSonuclar[i].brut;
        toplamNet += aylikSonuclar[i].net;
        toplamSGKIsveren += aylikSonuclar[i].issizlikSigortasiIsverenPayi;
        toplamSGKIs += aylikSonuclar[i].sgkIsciPayi;
        toplamIssizlikIsveren += aylikSonuclar[i].issizlikSigortasiIsverenPayi;
        toplamIssizlikIs += aylikSonuclar[i].issizlikSigortasiIsciPayi;
        toplamGelirVergisi += aylikSonuclar[i].gelirVergisi;
        toplamDamgaVergisi += aylikSonuclar[i].damgaVergisi;
        toplamMaliyet += aylikSonuclar[i].isvereneMaliyet;
        toplamGelirVergisiMatrahi += aylikSonuclar[i].gelirVergisiMatrahi;
        toplamKumulatifGelirVergisiMatrahi = aylikSonuclar[i].kumulatifGelirVergisiMatrahi; // Her satırda güncelleniyor
        toplamAsgariUcretGelirVergisiIstisnaTutari += aylikSonuclar[i].asgariUcretGelirVergisiIstisnaTutari;
        toplamAsgariUcretDamgaVergisiIstisnaTutari += aylikSonuclar[i].asgariUcretDamgaVergisiIstisnaTutari;
    }

    toplamSatir.cells[1].textContent = toplamBrut.toFixed(2) + " TL";
    toplamSatir.cells[2].textContent = toplamSGKIs.toFixed(2) + " TL";
    toplamSatir.cells[3].textContent = toplamIssizlikIs.toFixed(2) + " TL";
    toplamSatir.cells[4].textContent = toplamIssizlikIsveren.toFixed(2) + " TL";
    toplamSatir.cells[5].textContent = toplamKumulatifGelirVergisiMatrahi.toFixed(2) + " TL";
    toplamSatir.cells[6].textContent = toplamGelirVergisiMatrahi.toFixed(2) + " TL";
    toplamSatir.cells[7].textContent = toplamAsgariUcretGelirVergisiIstisnaTutari.toFixed(2) + " TL";
    toplamSatir.cells[8].textContent = toplamGelirVergisi.toFixed(2) + " TL";
    toplamSatir.cells[9].textContent = toplamAsgariUcretDamgaVergisiIstisnaTutari.toFixed(2) + " TL";
    toplamSatir.cells[10].textContent = toplamDamgaVergisi.toFixed(2) + " TL";
    toplamSatir.cells[11].textContent = toplamNet.toFixed(2) + " TL";
    toplamSatir.cells[12].textContent = toplamMaliyet.toFixed(2) + " TL";

    document.getElementById("sonuclar").style.display = "block";
}

// Hesapla butonuna tıklama olayını ekle
document.getElementById("hesapla-button").addEventListener("click", maasHesaplama);

// Teşvik seçildiğinde ek alanların açılıp kapanması
document.getElementById("sigorta-durumu").addEventListener("change", function() {
    if (this.value === "tesvikli") {
        document.getElementById("tesvik-bilgileri").style.display = "block";
    } else {
        document.getElementById("tesvik-bilgileri").style.display = "none";
    }
});