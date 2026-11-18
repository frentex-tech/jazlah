# One-off: adds dev/staging/prod build configurations and schemes to ios/Runner.xcodeproj.
# Flutter expects configurations named <Debug|Release|Profile>-<flavor> and a scheme per flavor.
# Idempotent: re-running skips what exists. Run: ruby scripts/setup_ios_flavors.rb
require 'xcodeproj'

FLAVORS = {
  'dev' => { id: 'sa.jazlah.app.dev', name: 'JAZLA Dev' },
  'staging' => { id: 'sa.jazlah.app.staging', name: 'JAZLA Staging' },
  'prod' => { id: 'sa.jazlah.app', name: 'جزلة' },
}
BASES = %w[Debug Release Profile]
path = File.expand_path('../ios/Runner.xcodeproj', __dir__)
project = Xcodeproj::Project.open(path)

def clone(list, base, name)
  return if list.build_configurations.any? { |c| c.name == name }
  src = list.build_configurations.find { |c| c.name == base }
  copy = list.project.new(Xcodeproj::Project::Object::XCBuildConfiguration)
  copy.name = name
  copy.build_settings = Marshal.load(Marshal.dump(src.build_settings))
  copy.base_configuration_reference = src.base_configuration_reference
  list.build_configurations << copy
  copy
end

lists = [project.build_configuration_list] + project.targets.map(&:build_configuration_list)
lists.each do |list|
  list.build_configurations.each { |c| c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0' if c.build_settings.key?('IPHONEOS_DEPLOYMENT_TARGET') }
  FLAVORS.each_key { |f| BASES.each { |b| clone(list, b, "#{b}-#{f}") } }
end

runner = project.targets.find { |t| t.name == 'Runner' }
runner.build_configurations.each do |c|
  flavor = c.name.split('-')[1] || 'dev'
  c.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = FLAVORS[flavor][:id]
  c.build_settings['APP_DISPLAY_NAME'] = FLAVORS[flavor][:name]
  c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0'
end
tests = project.targets.find { |t| t.name == 'RunnerTests' }
tests&.build_configurations&.each { |c| c.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'sa.jazlah.app.RunnerTests' }
project.save

schemes = File.join(path, 'xcshareddata/xcschemes')
template = File.read(File.join(schemes, 'Runner.xcscheme'))
FLAVORS.each_key do |f|
  xml = template.gsub(/buildConfiguration = "(Debug|Release|Profile)"/) { "buildConfiguration = \"#{$1}-#{f}\"" }
  File.write(File.join(schemes, "#{f}.xcscheme"), xml)
end
puts 'iOS flavors ready'
