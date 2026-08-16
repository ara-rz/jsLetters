#!/usr/bin/env ruby
# -*- coding: utf-8 -*-
=begin
引数でフォルダを指定したら、そこにある画像を元に images.js を生成する
=end
dir = ARGV.shift
dir+='/' if /\/$/ !~ dir
h={}
Dir[dir+'*.[jpw][pne]*'].each do |f|
  key = f.sub(/(_[a-z])(\d{1,3})/){$1+"%03d"%($2.to_i)}
  # 小賢しく、 _p1.jpg 〜 _p9.jpg 〜 _p10.jpg 〜 という順番でソートされる様にしてみる
  h[key] = f
end
puts 'const images = ['
h.keys.to_a.sort.each do |k|
  puts '"' + h[k] + '",'
end
puts '];'
