require 'rake'
require 'rake/clean'

# You need this: http://code.google.com/closure/compiler/
COMPILER = 'closure-compiler' # --compilation_level ADVANCED_OPTIMIZATIONS'

CLEAN.include('system/miniLOL.min.js')

def minify (file, out=nil)
    if !File.exists?(file)
        return false
    end

    if !out
        out = file.clone;
        out[out.length - 3, 3] = '.min.js'
    end

    if !File.exists?(out) || File.mtime(file) > File.mtime(out)
        result = `#{COMPILER} --js '#{file}' --js_output_file '#{out}'`

        if $? != 0
            File.delete(out) rescue nil

            return false
        end
    else
        return 1
    end

    return true
end

def miniHeader (file)
    content = File.read(file)

    file = File.new(file, 'w');
    file.puts '/* miniLOL is released under AGPLv3. Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org] */'
    file.write content
    file.close
end

task :default do
    updated = false

    if !File.exists?('system/miniLOL.min.js')
        updated = true
    else
        ['miniLOL', 'miniLOL-framework'].each {|file|
            if File.mtime("system/#{file}.js") >= File.mtime('system/miniLOL.min.js')
                updated = true
                break
            end
        }
    end

    if updated
        minified = File.new(`mktemp -u`.strip, 'w')
        minified.write(File.read('system/miniLOL.js') + File.read('system/miniLOL-framework.js'))
        minified.close

        minify(minified.path, 'system/miniLOL.min.js') || exit
        miniHeader('system/miniLOL.min.js')
    end
end
