# One-off: adds Runner/{ar,en}.lproj/InfoPlist.strings (localized permission texts) to the Runner target.
require 'xcodeproj'
project = Xcodeproj::Project.open(File.expand_path('../ios/Runner.xcodeproj', __dir__))
group = project.main_group['Runner']
unless group.children.any? { |c| c.display_name == 'InfoPlist.strings' }
  variant = group.new_variant_group('InfoPlist.strings')
  %w[ar en].each { |l| variant.new_file("#{l}.lproj/InfoPlist.strings").name = l }
  project.targets.find { |t| t.name == 'Runner' }.resources_build_phase.add_file_reference(variant)
  project.root_object.known_regions |= %w[ar en]
  project.save
end
puts 'InfoPlist.strings added'
