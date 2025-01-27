<?php
/*
Plugin Name: Maaş Hesaplama
Plugin URI:  (Eklenti için bir web sitesi adresi varsa buraya yazın)
Description: Brüt, net maaş ve işverene maliyet hesaplama eklentisi.
Version:     1.5
Author:      (Adınız)
Author URI:  (Web sitenizin adresi)
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: maas-hesaplama
*/

// Doğrudan erişimi engelle
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

// Kısa kod fonksiyonu
function maas_hesaplama_shortcode() {
    ob_start(); // Çıktı tamponlamayı başlat
    ?>
    <div id="maas-hesaplama-formu">
        <form id="maas-hesaplama">
            <label for="hesaplama-turu">Hesaplama Türü:</label>
            <select id="hesaplama-turu">
                <option value="brutten-nete">Brüt → Net</option>
                <option value="netten-brute">Net → Brüt</option>
                <option value="maliyetten-nete">İşverene Maliyet → Net</option>
                <option value="maliyetten-brute">İşverene Maliyet → Brüt</option>
            </select><br>

            <label for="ucret">Ücret:</label>
            <input type="number" id="ucret" required><br>

            <label for="donem-baslangic">Dönem Başlangıç:</label>
            <select id="donem-baslangic">
                <option value="1">Ocak</option>
                <option value="2">Şubat</option>
                <option value="3">Mart</option>
                <option value="4">Nisan</option>
                <option value="5">Mayıs</option>
                <option value="6">Haziran</option>
                <option value="7">Temmuz</option>
                <option value="8">Ağustos</option>
                <option value="9">Eylül</option>
                <option value="10">Ekim</option>
                <option value="11">Kasım</option>
                <option value="12">Aralık</option>
            </select><br>

            <label for="donem-bitis">Dönem Bitiş:</label>
            <select id="donem-bitis">
                <option value="1">Ocak</option>
                <option value="2">Şubat</option>
                <option value="3">Mart</option>
                <option value="4">Nisan</option>
                <option value="5">Mayıs</option>
                <option value="6">Haziran</option>
                <option value="7">Temmuz</option>
                <option value="8">Ağustos</option>
                <option value="9">Eylül</option>
                <option value="10">Ekim</option>
                <option value="11">Kasım</option>
                <option value="12" selected>Aralık</option>
            </select><br>

            <label for="calisma-gunu">Çalışma Günü (Ay):</label>
            <input type="number" id="calisma-gunu" value="30" required><br>

            <input type="checkbox" id="asgari-ucretli">
            <label for="asgari-ucretli">Asgari Ücretli</label><br>

            <label for="sigorta-durumu">Sigorta Durumu:</label>
            <select id="sigorta-durumu">
                <option value="normal">Normal</option>
                <option value="emekli">Emekli</option>
                <option value="tesvikli">Teşvikli</option>
            </select><br>
            
            <div id="tesvik-bilgileri" style="display: none;">
                <label for="tesvik-turu">Teşvik Türü:</label>
                <input type="text" id="tesvik-turu"><br>
                <label for="belge-no">Belge No:</label>
                <input type="text" id="belge-no"><br>
            </div>

            <input type="checkbox" id="issizlik-sigortasi">
            <label for="issizlik-sigortasi">İşsizlik Sigortası</label><br>

            <button type="button" id="hesapla-button">Hesapla</button>
        </form>

        <div id="sonuclar" style="display: none;">
            <h3>Yıllık Maliyet</h3>
            <table id="aylik-sonuclar">
                <thead>
                    <tr>
                        <th>Dönem</th>
                        <th>Brüt</th>
                        <th>SGK İşçi</th>
                        <th>İşsizlik İşçi</th>
                        <th>İşsizlik İşv.</th>
                        <th>KGVM</th>
                        <th>GV Mat.</th>
                        <th>AÜ GV İst. Tut.</th>
                        <th>GV</th>
                        <th>AÜ DV İst. Tut.</th>
                        <th>DV</th>
                        <th>Net</th>
                        <th>İşveren Maliyeti</th>
                    </tr>
                </thead>
                <tbody>
                    </tbody>
                <tfoot>
                    <tr id="toplam-satir">
                        <td>Toplam</td>
                        <td id="toplam-brut"></td>
                        <td id="toplam-sgk-isci"></td>
                        <td id="toplam-issizlik-isci"></td>
                        <td id="toplam-issizlik-isv"></td>
                        <td id="toplam-kgvm"></td>
                        <td id="toplam-gv-matrah"></td>
                        <td id="toplam-au-gv-ist-tut"></td>
                        <td id="toplam-gv"></td>
                        <td id="toplam-au-dv-ist-tut"></td>
                        <td id="toplam-dv"></td>
                        <td id="toplam-net"></td>
                        <td id="toplam-maliyet"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
    <?php
    return ob_get_clean(); // Tamponlanmış çıktıyı döndür ve temizle
}
add_shortcode( 'maas_hesaplama', 'maas_hesaplama_shortcode' );

// JavaScript ve CSS dosyalarını ekle
function maas_hesaplama_scriptleri_yukle() {
    wp_enqueue_script( 'maas-hesaplama-js', plugin_dir_url( __FILE__ ) . 'maas-hesaplama.js', array( 'jquery' ), '1.5', true );
    wp_enqueue_style( 'maas-hesaplama-css', plugin_dir_url( __FILE__ ) . 'maas-hesaplama.css', array(), '1.5', 'all' );
}
add_action( 'wp_enqueue_scripts', 'maas_hesaplama_scriptleri_yukle' );