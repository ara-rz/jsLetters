#!/usr/bin/env ruby
# -*- coding: utf-8 -*-
=begin
引数でフォルダを指定したら、そこにある画像を元に images.js を生成する
=end
dir = ARGV.shift
dir+='/' if /\/$/ !~ dir
h={}
Dir[dir+'*.[jpw][pne]*'].each do |f|
  key = f
  if /(\d+)\./ =~ f
    key = "%03d %s"%[$1.to_i,f] # 小賢しく、 _p1.jpg 〜 _p9.jpg 〜 _p10.jpg 〜 という順番でソートされる様にしてみる
  end
  h[key] = f
end
puts 'const images = ['
h.keys.to_a.sort.each do |k|
  puts '"' + h[k] + '",'
end
puts '];'
